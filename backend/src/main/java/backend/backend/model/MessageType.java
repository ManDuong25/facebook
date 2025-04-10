package backend.backend.model;

public enum MessageType {
    CHAT,        // Tin nhắn cá nhân 1-1
    GROUP_CHAT,  // Tin nhắn nhóm
    JOIN,        // Thông báo người dùng tham gia
    LEAVE        // Thông báo người dùng rời khỏi
}
