package backend.backend.repository;
import backend.backend.model.Notification;
import  backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Tìm thông báo theo người dùng, sắp xếp theo thời gian tạo (mới nhất trước)
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    // Tìm thông báo theo người dùng và trạng thái đã đọc
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
    
    // Đếm số thông báo chưa đọc
    long countByUserAndIsRead(User user, Boolean isRead);
}
