package backend.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotMessageResponse {
    private Long id;
    private String content;
    private Boolean isBot;
    private LocalDateTime timestamp;
    
    // Constructor từ entity
    public ChatbotMessageResponse(backend.backend.model.ChatbotMessage message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.isBot = message.getIsBot();
        this.timestamp = message.getTimestamp();
    }
}
