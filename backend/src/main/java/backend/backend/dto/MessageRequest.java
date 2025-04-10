package backend.backend.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private String message;
    private Long senderId;
    private Long receiverId;
}