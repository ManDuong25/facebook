package backend.backend.repository;
import backend.backend.model.PostLike;
import backend.backend.model.Post;
import backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // Đảm bảo import Optional

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    // Lấy tất cả lượt like của 1 bài viết
    List<PostLike> findByPost(Post post);

    // Lấy tất cả lượt like mà 1 user đã thực hiện
    List<PostLike> findByUser(User user);

    // Kiểm tra xem một người dùng đã thích bài viết hay chưa
    Optional<PostLike> findByPostAndUser(Post post, User user);
}