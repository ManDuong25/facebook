package backend.backend.service;

import backend.backend.model.Comment;
import backend.backend.model.Post;
import backend.backend.model.User;
import backend.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    // Thêm bình luận (dùng cho API POST /api/comments)
    public Comment addComment(Long postId, Long userId, String content) {
        Post post = postService.getPostById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    // Method cũ, không còn dùng vì controller gọi method bên dưới
    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    // Lấy danh sách bình luận của bài viết (dùng cho API GET /api/comments?postId={postId})
    public List<Comment> getCommentsByPost(Long postId) {
        Post post = postService.getPostById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return commentRepository.findByPost(post);
    }

    // Lấy bình luận theo id (dùng cho API GET /api/comments/{id})
    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    // Cập nhật bình luận (dùng cho API PUT /api/comments/{id})
    public Comment updateComment(Long id, Comment commentUpdate) {
        Optional<Comment> existingCommentOpt = commentRepository.findById(id);
        if (existingCommentOpt.isPresent()) {
            Comment existingComment = existingCommentOpt.get();
            existingComment.setContent(commentUpdate.getContent());
            return commentRepository.save(existingComment);
        }
        return null;
    }

    // Xóa bình luận (dùng cho API DELETE /api/comments/{id})
    public boolean deleteComment(Long id) {
        if (commentRepository.existsById(id)) {
            commentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}