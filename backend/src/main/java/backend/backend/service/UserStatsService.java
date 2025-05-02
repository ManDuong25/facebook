package backend.backend.service;

import backend.backend.model.Post;
import backend.backend.model.PostLike;
import backend.backend.model.User;
import backend.backend.repository.CommentRepository;
import backend.backend.repository.PostRepository;
import backend.backend.repository.ShareRepository;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service chuyên xử lý các thống kê liên quan đến người dùng
 * Giải quyết vấn đề phụ thuộc vòng tròn giữa UserService và các service khác
 */
@Service
public class UserStatsService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private ShareRepository shareRepository;
    
    @Autowired
    private FriendService friendService;
    
    @Autowired
    private PostLikeService postLikeService;
    
    /**
     * Lấy thông tin chi tiết của người dùng bao gồm các thống kê hoạt động
     */
    public Map<String, Object> getUserDetailWithStats(Long userId) {
        // Lấy thông tin người dùng
        Optional<User> userOpt = userRepository.findByIdAndDeletedAtIsNull(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + userId);
        }
        
        User user = userOpt.get();
        
        // Tạo đối tượng chứa thông tin chi tiết
        Map<String, Object> userDetail = new HashMap<>();
        
        // Thông tin cơ bản
        userDetail.put("id", user.getId());
        userDetail.put("username", user.getUsername());
        userDetail.put("email", user.getEmail());
        userDetail.put("firstName", user.getFirstName());
        userDetail.put("lastName", user.getLastName());
        userDetail.put("fullName", user.getFirstName() + " " + user.getLastName());
        userDetail.put("avatar", user.getAvatar());
        userDetail.put("coverPhoto", user.getCoverPhoto());
        userDetail.put("dateOfBirth", user.getDateOfBirth());
        userDetail.put("gender", user.getGender());
        userDetail.put("createdAt", user.getCreatedAt());
        userDetail.put("isAdmin", user.getIsAdmin());
        userDetail.put("isBlocked", user.getIsBlocked());
        
        // Thông tin bổ sung
        userDetail.put("bio", user.getBio());
        userDetail.put("work", user.getWork());
        userDetail.put("education", user.getEducation());
        userDetail.put("currentCity", user.getCurrentCity());
        userDetail.put("hometown", user.getHometown());
        
        // Thống kê hoạt động
        Map<String, Object> stats = new HashMap<>();
        
        // Số lượng bài viết
        long postCount = postRepository.countByUserAndDeletedAtIsNull(user);
        stats.put("postCount", postCount);
        
        // Số lượng bạn bè
        List<User> friends = friendService.getFriendsByUserId(userId);
        stats.put("friendCount", friends.size());
        
        // Số lượng bình luận
        long commentCount = commentRepository.countByUser(user);
        stats.put("commentCount", commentCount);
        
        // Số lượng lượt thích đã thực hiện
        List<PostLike> likes = postLikeService.getLikesByUser(user);
        stats.put("likeCount", likes.size());
        
        // Số lượng chia sẻ đã thực hiện
        long shareCount = shareRepository.countByUser(user);
        stats.put("shareCount", shareCount);
        
        // Thêm thống kê vào kết quả
        userDetail.put("stats", stats);
        
        // Hoạt động gần đây (5 bài viết gần nhất)
        Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findByUserAndDeletedAtIsNull(user, pageable);
        userDetail.put("recentPosts", postPage.getContent());
        
        return userDetail;
    }
    
    /**
     * Đếm số lượng bài viết của một người dùng
     */
    public long countPostsByUser(User user) {
        return postRepository.countByUserAndDeletedAtIsNull(user);
    }
    
    /**
     * Đếm số lượng bình luận của một người dùng
     */
    public long countCommentsByUser(User user) {
        return commentRepository.countByUser(user);
    }
    
    /**
     * Đếm số lượng chia sẻ của một người dùng
     */
    public long countSharesByUser(User user) {
        return shareRepository.countByUser(user);
    }
    
    /**
     * Lấy các bài viết gần đây của một người dùng
     */
    public List<Post> getRecentPostsByUser(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findByUserAndDeletedAtIsNull(user, pageable);
        return postPage.getContent();
    }
}
