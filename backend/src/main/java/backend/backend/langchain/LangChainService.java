package backend.backend.langchain;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.retriever.Retriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;

import backend.backend.model.User;
import backend.backend.model.Post;
import backend.backend.model.Comment;
import backend.backend.repository.UserRepository;
import backend.backend.repository.PostRepository;
import backend.backend.repository.CommentRepository;
import backend.backend.service.UserStatsService;
import backend.backend.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Service for RAG using LangChain4j
 */
@Service
public class LangChainService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private UserStatsService userStatsService;
    @Autowired
    private FriendService friendService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.model}")
    private String geminiModel;

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    @SuppressWarnings("deprecation")
    private Retriever<TextSegment> retriever;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    public LangChainService() {
        // Initialize embedding model
        this.embeddingModel = new AllMiniLmL6V2EmbeddingModel();

        // Initialize embedding store
        this.embeddingStore = new InMemoryEmbeddingStore<>();
    }

    /**
     * Initialize the service
     */
    @PostConstruct
    public void init() {
        try {
            // Initialize retriever
            @SuppressWarnings("deprecation")
            Retriever<TextSegment> newRetriever = dev.langchain4j.retriever.EmbeddingStoreRetriever.from(
                    embeddingStore,
                    embeddingModel,
                    5);
            this.retriever = newRetriever;

            // Schedule periodic indexing of database content (every 24 hours)
            scheduler.scheduleWithFixedDelay(
                this::indexDatabaseContent,
                1, 24, TimeUnit.HOURS
            );

            // Initial indexing
            indexDatabaseContent();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Index database content for RAG
     */
    public void indexDatabaseContent() {
        try {

            List<Document> documents = new ArrayList<>();

            // Bọc trong try-catch để xử lý lỗi khi ApplicationContext đã bị đóng
            try {
                // Index user profiles
                List<User> users = userRepository.findAllNotDeleted();
                for (User user : users) {
                    StringBuilder userText = new StringBuilder();
                    userText.append("User Profile: ");
                    userText.append(user.getFirstName()).append(" ").append(user.getLastName());
                    userText.append(", Username: ").append(user.getUsername());
                    // Không lưu ID người dùng vào vector store vì lý do bảo mật

                    if (user.getBio() != null) {
                        userText.append(", Bio: ").append(user.getBio());
                    }

                    if (user.getWork() != null) {
                        userText.append(", Work: ").append(user.getWork());
                    }

                    if (user.getEducation() != null) {
                        userText.append(", Education: ").append(user.getEducation());
                    }

                    if (user.getCurrentCity() != null) {
                        userText.append(", Current City: ").append(user.getCurrentCity());
                    }

                    if (user.getHometown() != null) {
                        userText.append(", Hometown: ").append(user.getHometown());
                    }

                    try {
                        // Add user statistics
                        long postCount = userStatsService.countPostsByUser(user);
                        List<User> friends = friendService.getFriendsByUserId(user.getId());
                        long commentCount = userStatsService.countCommentsByUser(user);

                        userText.append(", Post Count: ").append(postCount);
                        userText.append(", Friend Count: ").append(friends.size());
                        userText.append(", Comment Count: ").append(commentCount);
                    } catch (Exception e) {
                        // Tiếp tục với thông tin cơ bản nếu không lấy được thống kê
                    }

                    Document document = Document.from(userText.toString());
                    documents.add(document);
                }

                // Index posts
                try {
                    List<Post> posts = postRepository.findByDeletedAtIsNull();
                    for (Post post : posts) {
                        StringBuilder postText = new StringBuilder();
                        postText.append("Post by ").append(post.getUser().getFirstName()).append(" ").append(post.getUser().getLastName());
                        postText.append(": ").append(post.getContent());
                        postText.append(" (Posted on: ").append(post.getCreatedAt()).append(")");

                        Document document = Document.from(postText.toString());
                        documents.add(document);
                    }
                } catch (Exception e) {

                }

                // Index comments
                try {
                    List<Comment> comments = commentRepository.findAll();
                    for (Comment comment : comments) {
                        StringBuilder commentText = new StringBuilder();
                        commentText.append("Comment by ").append(comment.getUser().getFirstName()).append(" ").append(comment.getUser().getLastName());
                        commentText.append(" on post by ").append(comment.getPost().getUser().getFirstName()).append(" ").append(comment.getPost().getUser().getLastName());
                        commentText.append(": ").append(comment.getContent());
                        commentText.append(" (Commented on: ").append(comment.getCreatedAt()).append(")");

                        Document document = Document.from(commentText.toString());
                        documents.add(document);
                    }
                } catch (Exception e) {
                    // Bỏ qua lỗi và tiếp tục
                }

                // Index friend relationships
                try {
                    List<User> allUsers = userRepository.findAllNotDeleted();
                    for (User user : allUsers) {
                        List<User> friends = friendService.getFriendsByUserId(user.getId());
                        if (friends != null && !friends.isEmpty()) {
                            for (User friend : friends) {
                                StringBuilder friendText = new StringBuilder();
                                friendText.append("Friendship: ");
                                friendText.append(user.getFirstName()).append(" ").append(user.getLastName());
                                friendText.append(" is friends with ");
                                friendText.append(friend.getFirstName()).append(" ").append(friend.getLastName());

                                Document document = Document.from(friendText.toString());
                                documents.add(document);
                            }
                        }
                    }
                } catch (Exception e) {
                    // Bỏ qua lỗi và tiếp tục
                }
            } catch (Exception e) {
                return; // Thoát sớm nếu có lỗi với repository
            }

            // Chỉ tiếp tục nếu có documents để index
            if (!documents.isEmpty()) {
                try {
                    // Split documents and ingest into embedding store
                    DocumentSplitter splitter = DocumentSplitters.recursive(500, 100);
                    EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                            .documentSplitter(splitter)
                            .embeddingModel(embeddingModel)
                            .embeddingStore(embeddingStore)
                            .build();
                    ingestor.ingest(documents);

                } catch (Exception e) {
                    // Bỏ qua lỗi khi đưa tài liệu vào embedding store
                }
            }
        } catch (IllegalStateException e) {
            // Xử lý lỗi khi ApplicationContext đã bị đóng
            if (e.getMessage() != null && !e.getMessage().contains("has been closed already")) {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String processQuery(Long userId, String query) {
        System.out.println("\n\n========== LANGCHAIN SERVICE PROCESS QUERY START ==========");
        System.out.println("userId: " + userId);
        System.out.println("query: " + query);

        try {
         // Lấy thông tin người dùng
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found with id: " + userId);
            }
            User user = userOpt.get();
            // Tìm kiếm các đoạn văn bản liên quan
            List<TextSegment> relevantSegments;
            try {
                @SuppressWarnings("deprecation")
                List<TextSegment> segments = retriever.findRelevant(query);
                relevantSegments = segments;
            } catch (Exception e) {
                relevantSegments = new ArrayList<>();
            }
            // Tạo ngữ cảnh từ các đoạn văn bản liên quan
            String context = createContextFromRelevantSegments(relevantSegments, user);

            // Kiểm tra nếu người dùng đang hỏi về ID của họ
            String queryLower = query.toLowerCase();
            boolean isAskingForId = queryLower.contains("id của tôi") ||
                                   queryLower.contains("id của tao") ||
                                   queryLower.contains("id của mình") ||
                                   queryLower.contains("id tôi") ||
                                   queryLower.contains("id tao") ||
                                   queryLower.contains("id mình") ||
                                   queryLower.contains("id của tui") ||
                                   queryLower.contains("id tui") ||
                                   queryLower.contains("id user") ||
                                   queryLower.contains("user id") ||
                                   queryLower.contains("userid");

            // Create prompt với hướng dẫn rõ ràng để tránh hallucination
            String prompt = "Thông tin để trả lời câu hỏi:\n\n" +
                    context + "\n\n" +
                    "Câu hỏi: " + query + "\n\n";

            // Thêm hướng dẫn đặc biệt nếu người dùng đang hỏi về ID
            if (isAskingForId) {
                prompt += "Lưu ý: Nếu câu hỏi liên quan đến ID người dùng, hãy trả lời rằng 'Vì lý do bảo mật, " +
                         "chúng tôi không thể cung cấp ID người dùng. ID là thông tin nội bộ của hệ thống và " +
                         "không cần thiết cho việc sử dụng ứng dụng.'\n\n";
            }

            prompt += "HƯỚNG DẪN QUAN TRỌNG:\n" +
                    "1. PHÂN LOẠI CÂU HỎI: Hãy phân tích xem câu hỏi thuộc loại nào:\n" +
                    "   a) Câu hỏi về dữ liệu người dùng (thông tin cá nhân, bạn bè, bài viết, v.v.)\n" +
                    "   b) Câu hỏi kiến thức chung (lịch sử, khoa học, thể thao, v.v.)\n" +
                    "   c) Câu hỏi chủ quan (ý kiến, đánh giá, v.v.)\n" +
                    "2. XỬ LÝ THEO LOẠI CÂU HỎI:\n" +
                    "   a) Nếu là câu hỏi về dữ liệu người dùng: Chỉ trả lời dựa trên thông tin được cung cấp ở trên.\n" +
                    "   b) Nếu là câu hỏi kiến thức chung hoặc chủ quan: PHẢI sử dụng kiến thức có sẵn của bạn để trả lời, KHÔNG được từ chối trả lời với lý do 'không có đủ thông tin'.\n" +
                    "3. VỚI CÂU HỎI KIẾN THỨC CHUNG:\n" +
                    "   - Ví dụ: 'Chiều cao cao nhất của con người là bao nhiêu?', 'Ai là tổng thống Mỹ?', 'Tại sao loài chim biết bay?'\n" +
                    "   - PHẢI trả lời dựa trên kiến thức chung của bạn, KHÔNG được trả lời 'Không có thông tin về điều này trong dữ liệu'.\n" +
                    "   - Trả lời đầy đủ, chính xác và hữu ích.\n" +
                    "4. KHÔNG ĐƯỢC TỰ BỊA THÔNG TIN về dữ liệu người dùng.\n" +
                    "5. KHÔNG tạo ra tên người dùng, số lượng bạn bè, hoặc bất kỳ dữ liệu người dùng nào không có trong thông tin được cung cấp.\n" +
                    "6. Hãy trả lời ngắn gọn, thân thiện và hữu ích.\n" +
                    "7. Không sử dụng ký tự Markdown như *, **, # trong phản hồi.";

            // Gọi OpenAI API để tạo câu trả lời
            System.out.println("Prompt sent to OpenAI API: " + prompt);
            String response = callOpenAiApi(prompt);
            System.out.println("Response from OpenAI API: " + response);
            System.out.println("========== LANGCHAIN SERVICE PROCESS QUERY END ==========\n\n");
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error in LangChainService.processQuery: " + e.getMessage());
            System.out.println("========== LANGCHAIN SERVICE PROCESS QUERY END (ERROR) ==========\n\n");
            return "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn: " + e.getMessage();
        }
    }

    /**
     * Call Gemini API
     * @param prompt Prompt for Gemini
     * @return Response from Gemini
     */
    private String callOpenAiApi(String prompt) {
        try {
            // Khởi tạo Gemini model
            GeminiChatModel geminiChatModel = new GeminiChatModel(
                geminiApiKey,
                geminiApiUrl,
                geminiModel
            );

            // Sử dụng Gemini API để gọi API
            String response = geminiChatModel.generate(prompt);
            System.out.println("DEBUG - Phản hồi từ Gemini API trong LangChainService: " + response);

            // Kiểm tra nếu phản hồi chứa lỗi API
            if (response.contains("Xin lỗi, đã xảy ra lỗi")) {
                System.out.println("DEBUG - Phát hiện lỗi Gemini API trong LangChainService");

                // Trả về phản hồi mặc định
                return "Tôi đã tìm kiếm thông tin liên quan đến câu hỏi của bạn, nhưng hiện tại tôi không thể truy cập được dữ liệu. Vui lòng thử lại sau.";
            }

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, đã xảy ra lỗi khi gọi API: " + e.getMessage();
        }
    }

    /**
     * Create context from relevant segments
     * @param relevantSegments List of relevant segments
     * @param user User
     * @return Context string
     */
    private String createContextFromRelevantSegments(List<TextSegment> relevantSegments, User user) {
        StringBuilder context = new StringBuilder();

        // Add user information
        context.append("Thông tin người dùng:\n");
        // Không hiển thị ID người dùng vì lý do bảo mật
        context.append("- Tên người dùng: ").append(user.getUsername()).append("\n");
        context.append("- Email: ").append(user.getEmail()).append("\n");
        context.append("- Họ tên: ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
        context.append("- Ngày tham gia: ").append(user.getCreatedAt()).append("\n");

        if (user.getWork() != null) {
            context.append("- Công việc: ").append(user.getWork()).append("\n");
        }

        if (user.getEducation() != null) {
            context.append("- Học vấn: ").append(user.getEducation()).append("\n");
        }

        if (user.getCurrentCity() != null) {
            context.append("- Thành phố hiện tại: ").append(user.getCurrentCity()).append("\n");
        }

        if (user.getHometown() != null) {
            context.append("- Quê quán: ").append(user.getHometown()).append("\n");
        }

        if (user.getBio() != null) {
            context.append("- Tiểu sử: ").append(user.getBio()).append("\n");
        }

        // Add user statistics
        long postCount = userStatsService.countPostsByUser(user);
        List<User> friends = friendService.getFriendsByUserId(user.getId());
        long commentCount = userStatsService.countCommentsByUser(user);

        context.append("- Số bài viết: ").append(postCount).append("\n");
        context.append("- Số bạn bè: ").append(friends.size()).append("\n");
        context.append("- Số bình luận: ").append(commentCount).append("\n");

        // Add recent posts
        List<Post> recentPosts = userStatsService.getRecentPostsByUser(user, 3);
        if (recentPosts != null && !recentPosts.isEmpty()) {
            context.append("\nBài viết gần đây:\n");
            for (int i = 0; i < recentPosts.size(); i++) {
                Post post = recentPosts.get(i);
                context.append("- ").append(post.getContent())
                      .append(" (").append(post.getCreatedAt()).append(")\n");
            }
        }

        // Add friends
        if (friends != null && !friends.isEmpty()) {
            context.append("\nDanh sách bạn bè (tối đa 5 người):\n");
            int count = 0;
            for (User friend : friends) {
                if (count >= 5) break;
                context.append("- ").append(friend.getFirstName()).append(" ").append(friend.getLastName()).append("\n");
                count++;
            }
        }

        context.append("\n");

        // Add relevant segments
        if (!relevantSegments.isEmpty()) {
            context.append("Thông tin liên quan:\n");

            for (int i = 0; i < relevantSegments.size(); i++) {
                TextSegment segment = relevantSegments.get(i);
                context.append(i + 1).append(". ").append(segment.text()).append("\n");
            }
        }

        return context.toString();
    }
}
