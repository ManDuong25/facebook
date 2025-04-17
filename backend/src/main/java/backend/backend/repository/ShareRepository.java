package backend.backend.repository;

import backend.backend.model.Share;
import backend.backend.model.Post;
import backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // Đảm bảo import Optional

@Repository
public interface ShareRepository extends JpaRepository<Share, Long> {
    // Lấy tất cả lượt share của 1 bài viết
    List<Share> findByPost(Post post);

    // Lấy tất cả share mà 1 user đã thực hiện
    List<Share> findByUser(User user);

    // Kiểm tra xem một người dùng đã chia sẻ bài viết hay chưa
    Optional<Share> findByPostAndUser(Post post, User user);
}