package backend.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với User gửi tin nhắn (fetch = LAZY để tránh load dữ liệu không cần thiết)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnore // Tránh vòng lặp dữ liệu khi chuyển JSON
    private User sender;

    // Liên kết với User nhận tin nhắn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = true)
    @JsonIgnore // Tránh vòng lặp dữ liệu khi chuyển JSON
    private User receiver;

    // Nội dung tin nhắn
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // Loại tin nhắn: CHAT, GROUP_CHAT, JOIN, LEAVE
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    // Thời gian gửi tin nhắn, định dạng hiển thị khi chuyển JSON
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime sentAt;

    // Constructor không cần sentAt để tự động gán thời gian hiện tại khi tạo tin nhắn
    public Message(User sender, User receiver, String content, MessageType type) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.type = type;
        this.sentAt = LocalDateTime.now();
    }

    // Getter tùy chỉnh để lấy ID của người gửi
    public Long getSenderId() {
        return sender != null ? sender.getId() : null;
    }

    // Getter tùy chỉnh để lấy ID của người nhận
    public Long getReceiverId() {
        return receiver != null ? receiver.getId() : null;
    }

    // ====== MỚI THÊM: Lấy username của sender/receiver ======
    public String getSenderUsername() {
        return sender != null ? sender.getUsername() : null;
    }

    public String getReceiverUsername() {
        return receiver != null ? receiver.getUsername() : null;
    }
}
