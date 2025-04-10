package backend.backend.service;

import backend.backend.model.Notification;
import backend.backend.model.Post;
import backend.backend.model.PostLike;
import backend.backend.model.User;
import backend.backend.repository.NotificationRepository;
import backend.backend.repository.PostLikeRepository;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Tạo thông báo mới
     */
    public Notification createNotification(Long userId, Notification.NotificationType type, Long referenceId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setContent(content);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Lấy tất cả thông báo của một người dùng
     */
    public List<Notification> getNotificationsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));
        
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    /**
     * Đánh dấu thông báo đã đọc
     */
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại."));
        
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
    
    /**
     * Đánh dấu tất cả thông báo của một người dùng đã đọc
     */
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));
        
        List<Notification> notifications = notificationRepository.findByUserAndIsRead(user, false);
        notifications.forEach(notification -> notification.setIsRead(true));
        
        notificationRepository.saveAll(notifications);
    }
    
    /**
     * Đếm số thông báo chưa đọc
     */
    public long countUnreadNotifications(Long userId) {
        User user = new User();
        user.setId(userId);
        
        return notificationRepository.countByUserAndIsRead(user, false);
    }
    
    /**
     * Xóa thông báo
     */
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại."));
        
        notificationRepository.delete(notification);
    }
}
