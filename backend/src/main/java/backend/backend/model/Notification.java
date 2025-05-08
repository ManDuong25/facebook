package backend.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    private String content;

    // ID tham chiếu (có thể là ID của bài viết, lời mời kết bạn, v.v.)
    private Long referenceId;

    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Loại thông báo
    public enum NotificationType {
        FRIEND_REQUEST, // Lời mời kết bạn
        FRIEND_ACCEPT, // Chấp nhận lời mời kết bạn
        POST_LIKE, // Thích bài viết
        POST_COMMENT, // Bình luận bài viết
        POST_SHARE, // Chia sẻ bài viết
        MESSAGE, // Tin nhắn mới
        CREATE_POST // Tạo bài viết mới
    }
}
