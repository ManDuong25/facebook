package backend.backend.langchain;

import backend.backend.repository.UserRepository;

import dev.langchain4j.agent.tool.Tool;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.annotation.PostConstruct;


/**
 * Service for Agent-based chatbot using LangChain4j
 */
@Service
public class LangChainAgentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LangChainService langChainService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.model}")
    private String geminiModel;

    private GeminiChatModel geminiChatModel;
    private String originalQuery;

    // ThreadLocal để lưu trữ userId hiện tại
    private static final ThreadLocal<Long> currentUserId = new ThreadLocal<>();

    /**
     * Initialize the service
     */
    @PostConstruct
    public void init() {
        // Khởi tạo Gemini model làm mặc định
        this.geminiChatModel = new GeminiChatModel(
            geminiApiKey,
            geminiApiUrl,
            geminiModel
        );
    }



    public String processQuery(Long userId, String query) {
        try {
            // Kiểm tra người dùng tồn tại
            if (!userRepository.existsById(userId)) {
                throw new RuntimeException("User not found with id: " + userId);
            }

            // Lưu userId vào ThreadLocal để các công cụ có thể truy cập
            currentUserId.set(userId);
            this.originalQuery = query;

            try {
                // Tạo danh sách function declarations
                List<Map<String, Object>> functionDeclarations = createFunctionDeclarations();

                // Gọi Gemini API với function calling
                Map<String, Object> response = geminiChatModel.generateWithFunctions(query, functionDeclarations);

                // Kiểm tra xem có function call không
                if (response.containsKey("hasFunctionCall") && (boolean) response.get("hasFunctionCall")) {
                    // Lấy thông tin function call
                    String functionName = (String) response.get("functionName");
                    Map<String, Object> args = (Map<String, Object>) response.get("args");

                    // Thực thi function
                    Object functionResult = executeFunctionByName(functionName, args);

                    // Gửi kết quả function trở lại Gemini để tạo phản hồi cuối cùng
                    String finalResponse = geminiChatModel.generateWithFunctionResponse(
                        query, functionName, args, functionResult);

                    return finalResponse;
                } else {
                    // Không có function call, trả về text trực tiếp
                    System.out.println("DEBUG: Không có function call, response: " + response);
                    if (response.containsKey("error") && (boolean) response.get("error")) {
                        // Có lỗi, sử dụng searchWithRAG như phương án dự phòng
                        System.out.println("DEBUG: Có lỗi, sử dụng searchWithRAG");
                        return searchWithRAG(userId, query);
                    } else {
                        String text = (String) response.get("text");
                        System.out.println("DEBUG: Text từ Gemini: [" + text + "]");
                        // Kiểm tra nếu text rỗng hoặc null, gọi answerGeneralQuestion trực tiếp
                        if (text == null || text.trim().isEmpty()) {
                            System.out.println("DEBUG: Text rỗng, gọi answerGeneralQuestion");
                            return answerGeneralQuestion(query);
                        }
                        return text;
                    }
                }
            } catch (Exception e) {
                // Nếu có lỗi, sử dụng searchWithRAG như phương án dự phòng
                try {
                    return searchWithRAG(userId, query);
                } catch (Exception ex) {
                    throw e;
                }
            } finally {
                currentUserId.remove();
            }
        } catch (Exception e) {
            e.printStackTrace();
            currentUserId.remove();
            return "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn: " + e.getMessage();
        }
    }

    /**
     * Tạo danh sách function declarations cho Gemini API
     */
    private List<Map<String, Object>> createFunctionDeclarations() {
        List<Map<String, Object>> functionDeclarations = new ArrayList<>();

        // Thêm searchWithRAG function
        Map<String, Object> searchWithRAGFunction = new HashMap<>();
        searchWithRAGFunction.put("name", "searchWithRAG");
        searchWithRAGFunction.put("description", "Search for information using RAG when the question is directly related to specific user data");

        Map<String, Object> searchWithRAGParameters = new HashMap<>();
        searchWithRAGParameters.put("type", "object");

        Map<String, Object> searchWithRAGProperties = new HashMap<>();
        Map<String, Object> queryProperty = new HashMap<>();
        queryProperty.put("type", "string");
        queryProperty.put("description", "The query to search for information");
        searchWithRAGProperties.put("query", queryProperty);

        searchWithRAGParameters.put("properties", searchWithRAGProperties);

        List<String> searchWithRAGRequired = new ArrayList<>();
        searchWithRAGRequired.add("query");
        searchWithRAGParameters.put("required", searchWithRAGRequired);

        searchWithRAGFunction.put("parameters", searchWithRAGParameters);
        functionDeclarations.add(searchWithRAGFunction);

        // Thêm answerGeneralQuestion function
        Map<String, Object> answerGeneralQuestionFunction = new HashMap<>();
        answerGeneralQuestionFunction.put("name", "answerGeneralQuestion");
        answerGeneralQuestionFunction.put("description", "Answer general questions not related to user data, including subjective questions and general knowledge");

        Map<String, Object> answerGeneralQuestionParameters = new HashMap<>();
        answerGeneralQuestionParameters.put("type", "object");

        Map<String, Object> answerGeneralQuestionProperties = new HashMap<>();
        Map<String, Object> questionProperty = new HashMap<>();
        questionProperty.put("type", "string");
        questionProperty.put("description", "The general question to answer");
        answerGeneralQuestionProperties.put("question", questionProperty);

        answerGeneralQuestionParameters.put("properties", answerGeneralQuestionProperties);

        List<String> answerGeneralQuestionRequired = new ArrayList<>();
        answerGeneralQuestionRequired.add("question");
        answerGeneralQuestionParameters.put("required", answerGeneralQuestionRequired);

        answerGeneralQuestionFunction.put("parameters", answerGeneralQuestionParameters);
        functionDeclarations.add(answerGeneralQuestionFunction);

        // Thêm các function khác (chưa triển khai)
        Map<String, Object> createPostFunction = new HashMap<>();
        createPostFunction.put("name", "createPost");
        createPostFunction.put("description", "Create a new post (not implemented yet)");

        Map<String, Object> createPostParameters = new HashMap<>();
        createPostParameters.put("type", "object");

        Map<String, Object> createPostProperties = new HashMap<>();
        Map<String, Object> contentProperty = new HashMap<>();
        contentProperty.put("type", "string");
        contentProperty.put("description", "The content of the post");
        createPostProperties.put("content", contentProperty);

        createPostParameters.put("properties", createPostProperties);

        List<String> createPostRequired = new ArrayList<>();
        createPostRequired.add("content");
        createPostParameters.put("required", createPostRequired);

        createPostFunction.put("parameters", createPostParameters);
        functionDeclarations.add(createPostFunction);

        return functionDeclarations;
    }

    /**
     * Thực thi function dựa trên tên và tham số
     */
    private Object executeFunctionByName(String functionName, Map<String, Object> args) {
        Long userId = currentUserId.get();

        switch (functionName) {
            case "searchWithRAG":
                String query = (String) args.get("query");
                String result = searchWithRAG(userId, query);
                Map<String, Object> searchResult = new HashMap<>();
                searchResult.put("result", result);
                return searchResult;

            case "answerGeneralQuestion":
                String question = (String) args.get("question");
                String answer = answerGeneralQuestion(question);
                Map<String, Object> answerResult = new HashMap<>();
                answerResult.put("result", answer);
                return answerResult;

            case "createPost":
                Map<String, Object> notImplementedResult = new HashMap<>();
                notImplementedResult.put("result", "Chức năng tạo bài đăng mới chưa được triển khai.");
                return notImplementedResult;

            case "sendFriendRequest":
                Map<String, Object> notImplementedResult2 = new HashMap<>();
                notImplementedResult2.put("result", "Chức năng gửi lời mời kết bạn chưa được triển khai.");
                return notImplementedResult2;

            case "analyzeImage":
                Map<String, Object> notImplementedResult3 = new HashMap<>();
                notImplementedResult3.put("result", "Chức năng phân tích hình ảnh chưa được triển khai.");
                return notImplementedResult3;

            case "getWeather":
                Map<String, Object> notImplementedResult4 = new HashMap<>();
                notImplementedResult4.put("result", "Chức năng lấy thông tin thời tiết chưa được triển khai.");
                return notImplementedResult4;

            case "searchNews":
                Map<String, Object> notImplementedResult5 = new HashMap<>();
                notImplementedResult5.put("result", "Chức năng tìm kiếm tin tức chưa được triển khai.");
                return notImplementedResult5;

            default:
                String defaultAnswer = answerGeneralQuestion(originalQuery);
                Map<String, Object> defaultResult = new HashMap<>();
                defaultResult.put("result", defaultAnswer);
                return defaultResult;
        }
    }
    /*
    private String removeToolPrefix(String response) {
        if (response == null) {
            return "";
        }

        String cleanedResponse = response.replaceFirst("(?i)TOOL:\\s*[a-zA-Z]+\\s*", "");
        cleanedResponse = cleanedResponse.replaceFirst("^\\s+", "");
        return cleanedResponse;
    }
    */


    @Tool("Search for information using RAG")
    public String searchWithRAG(Long userId, String query) {
        try {
            return langChainService.processQuery(userId, query);
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi khi tìm kiếm thông tin: " + e.getMessage();
        }
    }


    @Tool("Create a new post")
    public String createPost(Long userId, String content) {
        // Đây là phương thức mẫu, chưa triển khai thực tế
        return "Chức năng tạo bài đăng mới chưa được triển khai.";
    }


    @Tool("Send friend request")
    public String sendFriendRequest(Long userId, String targetUsername) {
        // Đây là phương thức mẫu, chưa triển khai thực tế
        return "Chức năng gửi lời mời kết bạn chưa được triển khai.";
    }

    @Tool("Analyze image")
    public String analyzeImage(String imageUrl) {
        return "Chức năng phân tích hình ảnh chưa được triển khai.";
    }


    @Tool("Get weather information")
    public String getWeather(String location) {
        // Đây là phương thức mẫu, chưa triển khai thực tế
        return "Chức năng lấy thông tin thời tiết chưa được triển khai.";
    }

    /**
     * Tool to search news (chưa triển khai)
     */
    @Tool("Search news")
    public String searchNews(String topic) {
        // Đây là phương thức mẫu, chưa triển khai thực tế
        return "Chức năng tìm kiếm tin tức chưa được triển khai.";
    }





    /**
     * Tool to handle general questions not related to user data
     * @param question Câu hỏi cần trả lời
     * @return Câu trả lời cho câu hỏi
     */
    @Tool("Answer general questions not related to user data")
    public String answerGeneralQuestion(String question) {
        try {
            System.out.println("DEBUG: answerGeneralQuestion được gọi với câu hỏi: " + question);

            // Tạo prompt để hướng dẫn mô hình trả lời câu hỏi chung - đơn giản hóa để giảm số token
            String prompt = "Hãy trả lời câu hỏi sau một cách thân thiện, hữu ích và đầy đủ:\n\n" +
                    "Câu hỏi: " + question + "\n\n" +
                    "HƯỚNG DẪN:\n" +
                    "- Đây là câu hỏi kiến thức chung, hãy sử dụng kiến thức của bạn để trả lời đầy đủ và chính xác.\n" +
                    "- KHÔNG được từ chối trả lời với lý do 'không có đủ thông tin'.\n" +
                    "- Trả lời ngắn gọn nhưng đầy đủ, không quá 5 câu.\n" +
                    "- QUAN TRỌNG: KHÔNG sử dụng markdown hoặc định dạng đặc biệt nào. Viết văn bản thuần túy.\n" +
                    "- KHÔNG sử dụng dấu sao (*) hoặc dấu gạch dưới (_) để nhấn mạnh hoặc định dạng văn bản.";

            System.out.println("DEBUG: Prompt gửi đến Gemini: " + prompt);

            // Gọi Gemini API để lấy câu trả lời
            String response = geminiChatModel.generate(prompt);

            System.out.println("DEBUG: Phản hồi từ Gemini: [" + response + "]");


            System.out.println("DEBUG: Phản hồi sau khi xử lý: [" + response + "]");

            // Trả về câu trả lời đã xử lý
            return response;
        } catch (Exception e) {
            System.out.println("DEBUG: Lỗi trong answerGeneralQuestion: " + e.getMessage());
            e.printStackTrace();
            // Trả về câu trả lời mặc định nếu có lỗi
            return "Tôi có thể trả lời câu hỏi chung này dựa trên kiến thức của mình. Tôi là trợ lý AI của ứng dụng Facebook Clone, tôi có thể giúp bạn với các câu hỏi về ứng dụng hoặc các chủ đề chung.";
        }
    }


}
