package backend.backend.service;

import backend.backend.dto.NotificationDTO;
import backend.backend.model.Notification;
import backend.backend.model.Post;
import backend.backend.model.Share;
import backend.backend.model.User;
import backend.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    public Notification createNotification(Long senderId, Long receiverId, String content, Post post, Share share) {
        User sender = userService.getUserById(senderId);
        User receiver = userService.getUserById(receiverId);

        if (sender == null || receiver == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setContent(content);
        notification.setSender(sender);
        notification.setReceiver(receiver);
        notification.setPost(post);
        notification.setShare(share);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public List<NotificationDTO> getNotificationsByReceiverId(Long receiverId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotificationsByReceiverId(Long receiverId) {
        return notificationRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(receiverId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long countUnreadNotifications(Long receiverId) {
        return notificationRepository.countByReceiverIdAndIsReadFalse(receiverId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }

    public void markAllAsRead(Long receiverId) {
        List<Notification> notifications = notificationRepository
                .findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(receiverId);
        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setContent(notification.getContent());
        dto.setSenderId(notification.getSender().getId());
        dto.setSenderName(notification.getSender().getUsername());
        dto.setReceiverId(notification.getReceiver().getId());
        dto.setReceiverName(notification.getReceiver().getUsername());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());

        if (notification.getPost() != null) {
            dto.setPostId(notification.getPost().getId());
        }
        if (notification.getShare() != null) {
            dto.setShareId(notification.getShare().getId());
        }

        return dto;
    }
}
