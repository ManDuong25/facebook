package backend.backend.repository;
import backend.backend.model.Comment;
import backend.backend.model.Post;
import  backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Lấy tất cả bình luận của 1 bài viết
    List<Comment> findByPost(Post post);

    // Lấy tất cả bình luận của 1 user
    List<Comment> findByUser(User user);

    // Lấy tất cả bình luận của một bài viết và sắp xếp theo thời gian tạo
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);

    // Đếm số bình luận được tạo sau một ngày cụ thể
    int countByCreatedAtAfter(LocalDateTime date);

    // Đếm số bình luận của một người dùng
    long countByUser(User user);
}
