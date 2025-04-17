package backend.backend.repository;

import backend.backend.model.Post;
import backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Lấy tất cả các bài post của 1 user
    List<Post> findByUser(User user);

    // Lấy tất cả các bài post của 1 user và sắp xếp theo thời gian tạo mới nhất
    List<Post> findByUserOrderByCreatedAtDesc(User user);
}