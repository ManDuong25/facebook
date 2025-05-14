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
            if (!userRepository.existsById(userId)) {
                throw new RuntimeException("User not found with id: " + userId);
            }
            currentUserId.set(userId);
            this.originalQuery = query;

            try {
                List<Map<String, Object>> functionDeclarations = createFunctionDeclarations();

                Map<String, Object> response = geminiChatModel.generateWithFunctions(query, functionDeclarations);
                if (response.containsKey("hasFunctionCall") && (boolean) response.get("hasFunctionCall")) {
                    String functionName = (String) response.get("functionName");
                    Map<String, Object> args = (Map<String, Object>) response.get("args");

                    // Thực thi function
                    Object functionResult = executeFunctionByName(functionName, args);
                    if (functionResult instanceof Map) {
                        Map<?, ?> resultMap = (Map<?, ?>) functionResult;
                        if (resultMap.containsKey("result")) {
                            Object result = resultMap.get("result");
                            return result != null ? result.toString() : "Không có kết quả";
                        }
                    }

                    return functionResult.toString();
                } else {
                    // Nếu không có function call hoặc có lỗi, ưu tiên sử dụng RAG
                    if (response.containsKey("error") && (boolean) response.get("error")) {
                        return searchWithRAG(userId, query);
                    } else {
                        String text = (String) response.get("text");

                        // Kiểm tra nếu câu hỏi có thể liên quan đến thông tin cá nhân
                        if (isLikelyPersonalQuestion(query)) {
                            return searchWithRAG(userId, query);
                        }

                        if (text == null || text.trim().isEmpty()) {
                            return answerGeneralQuestion(query);
                        }

                        return text;
                    }
                }
            } catch (Exception e) {
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
        searchWithRAGFunction.put("description", "ALWAYS use this tool for ANY questions about the current user's personal information. This includes: username, email, full name (first name, last name), join date, work, education, current city, hometown, bio, post count, friend count, comment count, recent posts, friend list, or ANY other user-specific data. Examples: 'What is my name?', 'How many friends do I have?', 'What are my recent posts?', 'Who are my friends?', 'What is in my profile?', 'What is my email?', 'Where do I work?', 'Where am I from?', 'How many posts do I have?', 'How many comments have I made?', etc. IMPORTANT: If the question contains words like 'tôi', 'tao', 'mình', 'tui', 'của tôi', 'của tao', 'của mình', 'của tui', it's ALWAYS about the user and should use this tool.");

        Map<String, Object> searchWithRAGParameters = new HashMap<>();
        searchWithRAGParameters.put("type", "object");

        Map<String, Object> searchWithRAGProperties = new HashMap<>();
        Map<String, Object> queryProperty = new HashMap<>();
        queryProperty.put("type", "string");
        queryProperty.put("description", "The query to search for information about the user");
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
        answerGeneralQuestionFunction.put("description", "Use this tool ONLY for general knowledge questions that have NOTHING to do with the current user's personal information. Examples: 'What is the capital of France?', 'How does photosynthesis work?', 'Who invented the telephone?', 'What is the weather like today?', 'Tell me about history of Vietnam', etc. NEVER use this tool for ANY questions containing words like 'tôi', 'tao', 'mình', 'tui' or ANY questions about user profile, friends, posts, or personal data. If there is ANY doubt whether a question is about the user or general knowledge, DO NOT use this tool - use searchWithRAG instead.");

        Map<String, Object> answerGeneralQuestionParameters = new HashMap<>();
        answerGeneralQuestionParameters.put("type", "object");

        Map<String, Object> answerGeneralQuestionProperties = new HashMap<>();
        Map<String, Object> questionProperty = new HashMap<>();
        questionProperty.put("type", "string");
        questionProperty.put("description", "The general knowledge question to answer");
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
            // Tạo prompt để hướng dẫn mô hình trả lời câu hỏi chung - đơn giản hóa để giảm số token
            String prompt = "Hãy trả lời câu hỏi sau một cách thân thiện, hữu ích và đầy đủ:\n\n" +
                    "Câu hỏi: " + question + "\n\n" +
                    "HƯỚNG DẪN:\n" +
                    "- Đây là câu hỏi kiến thức chung, hãy sử dụng kiến thức của bạn để trả lời đầy đủ và chính xác.\n" +
                    "- KHÔNG được từ chối trả lời với lý do 'không có đủ thông tin'.\n" +
                    "- Trả lời ngắn gọn nhưng đầy đủ, không quá 5 câu.\n" +
                    "- QUAN TRỌNG: KHÔNG sử dụng markdown hoặc định dạng đặc biệt nào. Viết văn bản thuần túy.\n" +
                    "- KHÔNG sử dụng dấu sao (*) hoặc dấu gạch dưới (_) để nhấn mạnh hoặc định dạng văn bản.";

            // Gọi Gemini API để lấy câu trả lời
            String response = geminiChatModel.generate(prompt);

            // Trả về câu trả lời
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            // Trả về câu trả lời mặc định nếu có lỗi
            return "Tôi có thể trả lời câu hỏi chung này dựa trên kiến thức của mình. Tôi là trợ lý AI của ứng dụng Facebook Clone, tôi có thể giúp bạn với các câu hỏi về ứng dụng hoặc các chủ đề chung.";
        }
    }

    /**
     * Kiểm tra xem câu hỏi có khả năng liên quan đến thông tin cá nhân không
     * @param query Câu hỏi cần kiểm tra
     * @return true nếu câu hỏi có vẻ liên quan đến thông tin cá nhân
     */
    private boolean isLikelyPersonalQuestion(String query) {
        if (query == null) return false;

        String lowerQuery = query.toLowerCase();

        // Các từ khóa đại từ nhân xưng - nếu có các từ này, gần như chắc chắn là câu hỏi cá nhân
        String[] personalPronouns = {
            "tôi", "tao", "mình", "tui", "của tôi", "của tao", "của mình", "của tui",
            "tớ", "của tớ", "bản thân", "của bản thân", "cá nhân tôi", "cá nhân mình"
        };

        // Kiểm tra đại từ nhân xưng trước
        for (String pronoun : personalPronouns) {
            if (lowerQuery.contains(pronoun)) {
                return true;
            }
        }

        // Các từ khóa liên quan đến thông tin cá nhân từ LangChainService
        String[] personalInfoKeywords = {
            // Thông tin cơ bản
            "tên", "username", "họ tên", "first name", "last name", "email", "mail",
            "ngày tham gia", "join date", "ngày đăng ký", "register date",

            // Thông tin profile
            "profile", "hồ sơ", "tiểu sử", "bio", "công việc", "work", "job", "nghề nghiệp",
            "học vấn", "education", "trường học", "school", "đại học", "university", "college",
            "thành phố", "city", "sống ở đâu", "đang ở", "quê quán", "hometown", "quê", "sinh ra",

            // Thống kê
            "bài viết", "post", "số bài viết", "post count", "đăng bao nhiêu",
            "bạn bè", "friend", "số bạn bè", "friend count", "bao nhiêu bạn", "kết bạn",
            "bình luận", "comment", "số bình luận", "comment count", "bao nhiêu bình luận",

            // Danh sách
            "danh sách", "list", "gần đây", "recent", "bài gần đây", "recent post",
            "ai là bạn", "bạn của", "friend of", "kết bạn với", "connected with",

            // Từ khóa khác
            "thông tin", "information", "cá nhân", "personal", "user", "người dùng",
            "account", "tài khoản", "profile", "hồ sơ", "id", "số điện thoại", "phone",
            "địa chỉ", "address", "ngày sinh", "birthday", "sinh nhật"
        };

        // Kiểm tra từ khóa thông tin cá nhân
        for (String keyword : personalInfoKeywords) {
            if (lowerQuery.contains(keyword)) {
                return true;
            }
        }

        // Các mẫu câu hỏi cá nhân phổ biến
        String[] personalQuestionPatterns = {
            "là ai", "là gì", "bao nhiêu", "mấy", "ở đâu", "khi nào",
            "có những", "có mấy", "có bao nhiêu", "làm gì"
        };

        // Kiểm tra mẫu câu hỏi
        for (String pattern : personalQuestionPatterns) {
            if (lowerQuery.contains(pattern)) {
                // Nếu có mẫu câu hỏi nhưng không rõ ràng, ưu tiên coi là câu hỏi cá nhân
                return true;
            }
        }

        return false;
    }
}
