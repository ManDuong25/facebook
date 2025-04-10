package backend.backend.repository;
import backend.backend.model.Comment;
import backend.backend.model.Post;
import  backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Lấy tất cả bình luận của 1 bài viết
    List<Comment> findByPost(Post post);

    // Lấy tất cả bình luận của 1 user
    List<Comment> findByUser(User user);
}
