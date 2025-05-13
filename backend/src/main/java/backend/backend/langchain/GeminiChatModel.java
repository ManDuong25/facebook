package backend.backend.langchain;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Triển khai ChatLanguageModel sử dụng Google Gemini API
 */
public class GeminiChatModel implements ChatLanguageModel {
    private final String apiKey;
    private final String apiUrl;
    private final String model;
    private final HttpClient client;

    /**
     * Constructor cho GeminiChatModel
     *
     * @param apiKey Gemini API key
     * @param apiUrl Gemini API URL
     * @param model Tên mô hình (ví dụ: "gemini-2.5-flash-preview-04-17")
     */
    public GeminiChatModel(String apiKey, String apiUrl, String model) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        // Tạo HttpClient với timeout
        this.client = HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(10))
            .build();
    }

    @Override
    public String generate(String prompt) {
        try {
            System.out.println("DEBUG GeminiChatModel: generate được gọi với prompt: " + prompt);

            List<ChatMessage> messages = new ArrayList<>();
            messages.add(dev.langchain4j.data.message.UserMessage.from(prompt));

            System.out.println("DEBUG GeminiChatModel: Gọi generate với messages");
            Response<AiMessage> response = generate(messages);

            String result = response.content().text();
            System.out.println("DEBUG GeminiChatModel: Kết quả từ generate: [" + result + "]");

            return result;
        } catch (Exception e) {
            System.out.println("DEBUG GeminiChatModel: Lỗi trong generate: " + e.getMessage());
            e.printStackTrace();
            return "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + e.getMessage();
        }
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages) {
        try {
            System.out.println("DEBUG GeminiChatModel: generate(messages) được gọi");

            ObjectMapper objectMapper = new ObjectMapper();
            ObjectNode rootNode = objectMapper.createObjectNode();

            // Tạo mảng contents
            ArrayNode contentsArray = objectMapper.createArrayNode();
            ObjectNode contentObject = objectMapper.createObjectNode();

            // Tạo mảng parts
            ArrayNode partsArray = objectMapper.createArrayNode();

            // Xử lý tin nhắn hệ thống trước
            StringBuilder systemContent = new StringBuilder();
            for (ChatMessage message : messages) {
                if (message instanceof dev.langchain4j.data.message.SystemMessage) {
                    if (systemContent.length() > 0) {
                        systemContent.append("\n\n");
                    }
                    systemContent.append(message.toString());
                }
            }

            // Nếu có nội dung hệ thống, thêm nó như một phần đầu tiên
            if (systemContent.length() > 0) {
                ObjectNode systemPart = objectMapper.createObjectNode();
                systemPart.put("text", "System: " + systemContent.toString());
                partsArray.add(systemPart);
            }

            // Xử lý các tin nhắn không phải hệ thống
            for (ChatMessage message : messages) {
                if (message instanceof dev.langchain4j.data.message.SystemMessage) {
                    continue; // Bỏ qua tin nhắn hệ thống vì đã xử lý
                }

                ObjectNode part = objectMapper.createObjectNode();

                // Thêm role vào nội dung tin nhắn để Gemini hiểu
                String role = getRoleFromMessage(message);
                String content = message.toString();

                part.put("text", role + ": " + content);
                partsArray.add(part);
            }

            // Thêm parts vào content
            contentObject.set("parts", partsArray);
            contentsArray.add(contentObject);

            // Thêm contents vào root
            rootNode.set("contents", contentsArray);

            // Thêm các tham số khác - sử dụng tên tham số đúng cho Gemini API
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("temperature", 0.3); // Giảm temperature để có phản hồi nhanh và ổn định hơn
            generationConfig.put("maxOutputTokens", 2048); // Tăng số token để đảm bảo có đủ token cho output
            rootNode.set("generationConfig", generationConfig);

            // Chuyển đổi thành chuỗi JSON
            String requestBody = objectMapper.writeValueAsString(rootNode);
            System.out.println("DEBUG GeminiChatModel: Request body: " + requestBody);

            // Tạo URL với API key
            String fullUrl = apiUrl + "?key=" + apiKey;
            System.out.println("DEBUG GeminiChatModel: Gọi API URL: " + apiUrl);

            // Tạo HTTP request với timeout
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .header("Content-Type", "application/json")
                    .timeout(java.time.Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // Gửi request và nhận response
            System.out.println("DEBUG GeminiChatModel: Gửi request đến Gemini API");
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("DEBUG GeminiChatModel: Nhận response từ Gemini API, status code: " + response.statusCode());

            // Xử lý response
            if (response.statusCode() == 200) {
                System.out.println("DEBUG GeminiChatModel: Response body: " + response.body());
                JsonNode responseNode = objectMapper.readTree(response.body());

                String generatedText = responseNode
                        .path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();

                System.out.println("DEBUG GeminiChatModel: Generated text: [" + generatedText + "]");

                // Tạo AiMessage từ văn bản được tạo
                AiMessage aiMessage = AiMessage.from(generatedText);

                // Trả về đối tượng Response chứa AiMessage
                return Response.from(aiMessage);
            } else {
                System.out.println("DEBUG GeminiChatModel: Error response: " + response.body());
                String errorMessage = "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + response.statusCode() + " - " + response.body();
                AiMessage errorAiMessage = AiMessage.from(errorMessage);
                return Response.from(errorAiMessage);
            }
        } catch (Exception e) {
            System.out.println("DEBUG GeminiChatModel: Exception: " + e.getMessage());
            e.printStackTrace();
            String errorMessage = "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + e.getMessage();
            AiMessage errorAiMessage = AiMessage.from(errorMessage);
            return Response.from(errorAiMessage);
        }
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages, List<dev.langchain4j.agent.tool.ToolSpecification> toolSpecifications) {
        try {
            // Tạo ObjectMapper để xây dựng JSON
            ObjectMapper objectMapper = new ObjectMapper();
            ObjectNode rootNode = objectMapper.createObjectNode();

            // Tạo mảng contents
            ArrayNode contentsArray = objectMapper.createArrayNode();
            ObjectNode contentObject = objectMapper.createObjectNode();

            // Tạo mảng parts
            ArrayNode partsArray = objectMapper.createArrayNode();

            // Xử lý tin nhắn hệ thống trước
            StringBuilder systemContent = new StringBuilder();
            for (ChatMessage message : messages) {
                if (message instanceof dev.langchain4j.data.message.SystemMessage) {
                    if (systemContent.length() > 0) {
                        systemContent.append("\n\n");
                    }
                    systemContent.append(message.toString());
                }
            }

            // Nếu có nội dung hệ thống, thêm nó như một phần đầu tiên
            if (systemContent.length() > 0) {
                ObjectNode systemPart = objectMapper.createObjectNode();
                systemPart.put("text", "System: " + systemContent.toString());
                partsArray.add(systemPart);
            }

            // Xử lý các tin nhắn không phải hệ thống
            for (ChatMessage message : messages) {
                if (message instanceof dev.langchain4j.data.message.SystemMessage) {
                    continue; // Bỏ qua tin nhắn hệ thống vì đã xử lý
                }

                ObjectNode part = objectMapper.createObjectNode();

                // Thêm role vào nội dung tin nhắn để Gemini hiểu
                String role = getRoleFromMessage(message);
                String content = message.toString();

                part.put("text", role + ": " + content);
                partsArray.add(part);
            }

            // Thêm parts vào content
            contentObject.set("parts", partsArray);
            contentsArray.add(contentObject);

            // Thêm contents vào root
            rootNode.set("contents", contentsArray);

            // Thêm các tham số khác - sử dụng tên tham số đúng cho Gemini API
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("temperature", 0.3);
            generationConfig.put("maxOutputTokens", 512);
            rootNode.set("generationConfig", generationConfig);
            if (toolSpecifications != null && !toolSpecifications.isEmpty()) {
                ArrayNode toolsArray = objectMapper.createArrayNode();

                for (dev.langchain4j.agent.tool.ToolSpecification tool : toolSpecifications) {
                    ObjectNode toolNode = objectMapper.createObjectNode();
                    toolNode.put("name", tool.name());
                    toolNode.put("description", tool.description());

                    // Thêm các tham số của tool nếu có
                    if (tool.parameters() != null) {
                        ObjectNode parametersNode = objectMapper.createObjectNode();
                        // Đơn giản hóa, chỉ thêm tên tham số
                        ArrayNode requiredArray = objectMapper.createArrayNode();
                        for (String paramName : tool.parameters().required()) {
                            requiredArray.add(paramName);
                        }
                        parametersNode.set("required", requiredArray);
                        toolNode.set("parameters", parametersNode);
                    }

                    toolsArray.add(toolNode);
                }

                // Thêm tools vào request
                rootNode.set("tools", toolsArray);
            }

            // Chuyển đổi thành chuỗi JSON
            String requestBody = objectMapper.writeValueAsString(rootNode);

            // Tạo URL với API key
            String fullUrl = apiUrl + "?key=" + apiKey;

            // Tạo HTTP request với timeout
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .header("Content-Type", "application/json")
                    .timeout(java.time.Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // Gửi request và nhận response
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Xử lý response
            if (response.statusCode() == 200) {
                JsonNode responseNode = objectMapper.readTree(response.body());

                // Kiểm tra xem có lỗi liên quan đến tools không
                if (responseNode.has("error")) {
                    String errorMessage = responseNode.path("error").path("message").asText();
                    if (errorMessage.contains("tools") || errorMessage.contains("function")) {
                        return Response.from(AiMessage.from("Tools are currently not supported by this model: " + errorMessage));
                    }
                }

                String generatedText = responseNode
                        .path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();

                // Tạo AiMessage từ văn bản được tạo
                AiMessage aiMessage = AiMessage.from(generatedText);

                // Trả về đối tượng Response chứa AiMessage
                return Response.from(aiMessage);
            } else {
                String errorBody = response.body();
                // Kiểm tra xem lỗi có liên quan đến tools không
                if (errorBody.contains("tools") || errorBody.contains("function")) {
                    return Response.from(AiMessage.from("Tools are currently not supported by this model: " + errorBody));
                } else {
                    String errorMessage = "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + response.statusCode() + " - " + errorBody;
                    AiMessage errorAiMessage = AiMessage.from(errorMessage);
                    return Response.from(errorAiMessage);
                }
            }
        } catch (Exception e) {
            String errorMessage = "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + e.getMessage();
            AiMessage errorAiMessage = AiMessage.from(errorMessage);
            return Response.from(errorAiMessage);
        }
    }

    /**
     * Chuyển đổi loại tin nhắn LangChain4j sang vai trò cho Gemini
     */
    private String getRoleFromMessage(ChatMessage message) {
        if (message instanceof dev.langchain4j.data.message.UserMessage) {
            return "User";
        } else if (message instanceof dev.langchain4j.data.message.AiMessage) {
            return "Assistant";
        } else if (message instanceof dev.langchain4j.data.message.SystemMessage) {
            return "System";
        } else {
            // Mặc định là user cho các loại tin nhắn khác
            return "User";
        }
    }

    /**
     * Gọi Gemini API với function calling theo cú pháp chính thức của Google
     *
     * @param prompt Câu hỏi của người dùng
     * @param functionDeclarations Danh sách các function declarations
     * @return Kết quả từ API, bao gồm cả function call nếu có
     */
    public Map<String, Object> generateWithFunctions(String prompt, List<Map<String, Object>> functionDeclarations) {
        try {
            System.out.println("DEBUG GeminiChatModel: generateWithFunctions được gọi với prompt: " + prompt);
            System.out.println("DEBUG GeminiChatModel: Số lượng function declarations: " + functionDeclarations.size());

            ObjectMapper objectMapper = new ObjectMapper();
            ObjectNode rootNode = objectMapper.createObjectNode();

            // Tạo mảng contents
            ArrayNode contentsArray = objectMapper.createArrayNode();
            ObjectNode contentObject = objectMapper.createObjectNode();

            // Tạo mảng parts
            ArrayNode partsArray = objectMapper.createArrayNode();

            // Thêm prompt của người dùng
            ObjectNode userPart = objectMapper.createObjectNode();
            userPart.put("text", "User: " + prompt);
            partsArray.add(userPart);

            // Thêm parts vào content
            contentObject.set("parts", partsArray);
            contentsArray.add(contentObject);

            // Thêm contents vào root
            rootNode.set("contents", contentsArray);

            // Thêm các tham số khác
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("temperature", 0.3);
            generationConfig.put("maxOutputTokens", 2048); // Tăng số token để đảm bảo có đủ token cho output
            rootNode.set("generationConfig", generationConfig);

            // Thêm tools nếu có
            if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
                ArrayNode toolsArray = objectMapper.createArrayNode();

                // Tạo function declarations node
                ObjectNode functionDeclarationsNode = objectMapper.createObjectNode();
                ArrayNode functionsArray = objectMapper.createArrayNode();

                // Thêm từng function declaration
                for (Map<String, Object> functionDeclaration : functionDeclarations) {
                    ObjectNode functionNode = objectMapper.valueToTree(functionDeclaration);
                    functionsArray.add(functionNode);
                    System.out.println("DEBUG GeminiChatModel: Thêm function: " + functionDeclaration.get("name"));
                }

                functionDeclarationsNode.set("function_declarations", functionsArray);
                toolsArray.add(functionDeclarationsNode);

                // Thêm tools vào root
                rootNode.set("tools", toolsArray);
            }

            // Chuyển đổi thành chuỗi JSON
            String requestBody = objectMapper.writeValueAsString(rootNode);
            System.out.println("DEBUG GeminiChatModel: Request body: " + requestBody);

            // Tạo URL với API key
            String fullUrl = apiUrl + "?key=" + apiKey;
            System.out.println("DEBUG GeminiChatModel: Gọi API URL: " + apiUrl);

            // Tạo HTTP request với timeout
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .header("Content-Type", "application/json")
                    .timeout(java.time.Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // Gửi request và nhận response
            System.out.println("DEBUG GeminiChatModel: Gửi request đến Gemini API");
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("DEBUG GeminiChatModel: Nhận response từ Gemini API, status code: " + response.statusCode());

            // Xử lý response
            if (response.statusCode() == 200) {
                System.out.println("DEBUG GeminiChatModel: Response body: " + response.body());
                JsonNode responseNode = objectMapper.readTree(response.body());

                // Kiểm tra xem có function call không
                JsonNode candidateNode = responseNode.path("candidates").path(0);
                JsonNode contentNode = candidateNode.path("content");

                // Kiểm tra function call
                if (contentNode.has("parts") && contentNode.path("parts").size() > 0) {
                    JsonNode partNode = contentNode.path("parts").path(0);

                    if (partNode.has("functionCall")) {
                        // Có function call, trả về thông tin function call
                        JsonNode functionCallNode = partNode.path("functionCall");
                        String functionName = functionCallNode.path("name").asText();
                        JsonNode argsNode = functionCallNode.path("args");

                        System.out.println("DEBUG GeminiChatModel: Có function call, function: " + functionName);
                        System.out.println("DEBUG GeminiChatModel: Args: " + argsNode);

                        Map<String, Object> result = new HashMap<>();
                        result.put("hasFunctionCall", true);
                        result.put("functionName", functionName);
                        result.put("args", objectMapper.convertValue(argsNode, Map.class));
                        return result;
                    }
                }

                // Không có function call, trả về text
                String generatedText = contentNode.path("parts").path(0).path("text").asText();
                System.out.println("DEBUG GeminiChatModel: Không có function call, text: [" + generatedText + "]");

                Map<String, Object> result = new HashMap<>();
                result.put("hasFunctionCall", false);
                result.put("text", generatedText);
                return result;
            } else {
                // Xử lý lỗi
                System.out.println("DEBUG GeminiChatModel: Error response: " + response.body());
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("hasFunctionCall", false);
                errorResult.put("error", true);
                errorResult.put("text", "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + response.statusCode() + " - " + response.body());
                return errorResult;
            }
        } catch (Exception e) {
            // Xử lý exception
            System.out.println("DEBUG GeminiChatModel: Exception: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("hasFunctionCall", false);
            errorResult.put("error", true);
            errorResult.put("text", "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + e.getMessage());
            return errorResult;
        }
    }

    /**
     * Gửi kết quả của function call trở lại Gemini API để tiếp tục cuộc hội thoại
     *
     * @param prompt Câu hỏi ban đầu của người dùng
     * @param functionName Tên function đã được gọi
     * @param functionArgs Tham số của function
     * @param functionResult Kết quả của function
     * @return Phản hồi cuối cùng từ Gemini
     */
    public String generateWithFunctionResponse(String prompt, String functionName, Map<String, Object> functionArgs, Object functionResult) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ObjectNode rootNode = objectMapper.createObjectNode();

            // Tạo mảng contents
            ArrayNode contentsArray = objectMapper.createArrayNode();

            // Tin nhắn người dùng
            ObjectNode userContent = objectMapper.createObjectNode();
            ArrayNode userPartsArray = objectMapper.createArrayNode();
            ObjectNode userPart = objectMapper.createObjectNode();
            userPart.put("text", "User: " + prompt);
            userPartsArray.add(userPart);
            userContent.set("parts", userPartsArray);
            userContent.put("role", "user");
            contentsArray.add(userContent);

            // Tin nhắn model với function call
            ObjectNode modelContent = objectMapper.createObjectNode();
            ArrayNode modelPartsArray = objectMapper.createArrayNode();
            ObjectNode modelPart = objectMapper.createObjectNode();

            // Tạo function call
            ObjectNode functionCallNode = objectMapper.createObjectNode();
            functionCallNode.put("name", functionName);
            ObjectNode argsNode = objectMapper.valueToTree(functionArgs);
            functionCallNode.set("args", argsNode);
            modelPart.set("functionCall", functionCallNode);

            modelPartsArray.add(modelPart);
            modelContent.set("parts", modelPartsArray);
            modelContent.put("role", "model");
            contentsArray.add(modelContent);

            // Tin nhắn người dùng với function response
            ObjectNode functionResponseContent = objectMapper.createObjectNode();
            ArrayNode functionResponsePartsArray = objectMapper.createArrayNode();
            ObjectNode functionResponsePart = objectMapper.createObjectNode();

            // Tạo function response
            ObjectNode functionResponseNode = objectMapper.createObjectNode();
            functionResponseNode.put("name", functionName);
            ObjectNode responseNode = objectMapper.valueToTree(functionResult);
            functionResponseNode.set("response", responseNode);
            functionResponsePart.set("functionResponse", functionResponseNode);

            functionResponsePartsArray.add(functionResponsePart);
            functionResponseContent.set("parts", functionResponsePartsArray);
            functionResponseContent.put("role", "user");
            contentsArray.add(functionResponseContent);

            // Thêm contents vào root
            rootNode.set("contents", contentsArray);

            // Thêm các tham số khác
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("temperature", 0.3);
            generationConfig.put("maxOutputTokens", 2048); // Tăng số token để đảm bảo có đủ token cho output
            rootNode.set("generationConfig", generationConfig);

            // Chuyển đổi thành chuỗi JSON
            String requestBody = objectMapper.writeValueAsString(rootNode);

            // Tạo URL với API key
            String fullUrl = apiUrl + "?key=" + apiKey;

            // Tạo HTTP request với timeout
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .header("Content-Type", "application/json")
                    .timeout(java.time.Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // Gửi request và nhận response
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Xử lý response
            if (response.statusCode() == 200) {
                JsonNode responseJson = objectMapper.readTree(response.body());
                String generatedText = responseJson
                        .path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();

                return generatedText;
            } else {
                return "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + response.statusCode() + " - " + response.body();
            }
        } catch (Exception e) {
            return "Xin lỗi, đã xảy ra lỗi khi gọi API Gemini: " + e.getMessage();
        }
    }
}
