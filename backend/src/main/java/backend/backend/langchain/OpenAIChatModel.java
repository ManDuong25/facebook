package backend.backend.langchain;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Simple implementation of ChatLanguageModel using OpenAI API
 */
@Component
public class OpenAIChatModel implements ChatLanguageModel {

    private final String apiKey;
    private final String model;
    private final Double temperature;
    private final Integer maxTokens;
    private final HttpClient client;
    private final ObjectMapper objectMapper;

    /**
     * Constructor with OpenAI API configuration
     * @param apiKey OpenAI API key
     * @param model OpenAI model name
     * @param temperature Temperature parameter
     * @param maxTokens Maximum tokens to generate
     */
    public OpenAIChatModel(
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.model}") String model,
            @Value("${openai.temperature}") Double temperature,
            @Value("${openai.max-tokens}") Integer maxTokens) {

        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.client = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages) {
        try {
            String jsonResponse = callOpenAiApi(messages, false, null);
            String content = extractContentFromResponse(jsonResponse);
            return Response.from(AiMessage.from(content));
        } catch (Exception e) {
            e.printStackTrace();
            return Response.from(AiMessage.from("Error: " + e.getMessage()));
        }
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages, List<dev.langchain4j.agent.tool.ToolSpecification> toolSpecifications) {
        try {
            String jsonResponse = callOpenAiApi(messages, true, toolSpecifications);
            String content = extractContentFromResponse(jsonResponse);
            return Response.from(AiMessage.from(content));
        } catch (Exception e) {
            e.printStackTrace();
            return Response.from(AiMessage.from("Error: " + e.getMessage()));
        }
    }

    /**
     * Generate a response for a simple prompt
     * @param prompt The prompt to send to the model
     * @return The generated response
     */
    public String generate(String prompt) {
        try {
            List<ChatMessage> messages = new ArrayList<>();
            messages.add(UserMessage.from(prompt));
            String jsonResponse = callOpenAiApi(messages, false, null);
            return extractContentFromResponse(jsonResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating response: " + e.getMessage();
        }
    }

    private String callOpenAiApi(List<ChatMessage> messages, boolean useTools,
                                List<dev.langchain4j.agent.tool.ToolSpecification> toolSpecifications)
                                throws IOException, InterruptedException {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.put("temperature", temperature);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("store", true);

        ArrayNode messagesArray = requestBody.putArray("messages");
        for (ChatMessage message : messages) {
            ObjectNode messageNode = objectMapper.createObjectNode();
            messageNode.put("role", getRoleFromMessage(message));
            messageNode.put("content", message.toString());
            messagesArray.add(messageNode);
        }

        // Add tools if needed
        if (useTools && toolSpecifications != null && !toolSpecifications.isEmpty()) {
            ArrayNode toolsArray = requestBody.putArray("tools");

            for (dev.langchain4j.agent.tool.ToolSpecification tool : toolSpecifications) {
                ObjectNode toolNode = objectMapper.createObjectNode();
                toolNode.put("type", "function");

                ObjectNode functionNode = objectMapper.createObjectNode();
                functionNode.put("name", tool.name());
                functionNode.put("description", tool.description());

                // Simplified parameters
                ObjectNode parametersNode = objectMapper.createObjectNode();
                parametersNode.put("type", "object");

                functionNode.set("parameters", parametersNode);
                toolNode.set("function", functionNode);
                toolsArray.add(toolNode);
            }
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    private String extractContentFromResponse(String jsonResponse) throws IOException {
        JsonNode responseNode = objectMapper.readTree(jsonResponse);

        if (responseNode.has("error")) {
            return "API Error: " + responseNode.path("error").path("message").asText();
        }

        return responseNode
                .path("choices")
                .path(0)
                .path("message")
                .path("content")
                .asText();
    }

    private String getRoleFromMessage(ChatMessage message) {
        if (message instanceof dev.langchain4j.data.message.UserMessage) {
            return "user";
        } else if (message instanceof dev.langchain4j.data.message.AiMessage) {
            return "assistant";
        } else if (message instanceof dev.langchain4j.data.message.SystemMessage) {
            return "system";
        } else {
            return "user";
        }
    }
}
