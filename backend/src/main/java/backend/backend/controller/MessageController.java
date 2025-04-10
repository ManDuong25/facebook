package backend.backend.controller;

import backend.backend.dto.ChatMessage;
import backend.backend.dto.MessageRequest;
import backend.backend.model.Message;
import backend.backend.model.MessageType;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.MessageService;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService;

    // API gửi tin nhắn, lưu vào CSDL
    @PostMapping("/send")
    public ResponseObject sendMessage(@RequestBody MessageRequest messageRequest) {
        try {
            User sender = userService.findById(messageRequest.getSenderId()).orElse(null);
            User receiver = userService.findById(messageRequest.getReceiverId()).orElse(null);
            if (sender == null || receiver == null) {
                return new ResponseObject("error", "User not found", null);
            }
            Message message = new Message(sender, receiver, messageRequest.getMessage(), MessageType.CHAT);
            Message savedMessage = messageService.saveMessage(message);
            return new ResponseObject("success", "Message sent successfully", savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseObject("error", "Failed to send message", null);
        }
    }

    // Endpoint WebSocket để nhận tin nhắn real-time từ client
    @MessageMapping("/chat")
    public void handleChatMessage(@Payload ChatMessage chatMsg) {
        try {
            System.out.println("📩 Nhận tin nhắn từ client: " + chatMsg);

            // Lấy đối tượng User từ DB dựa trên senderId
            User sender = userService.findById(chatMsg.getSenderId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Tạo đối tượng Message (chỉ hỗ trợ chat 1-1)
            Message message = new Message();
            message.setSender(sender);
            message.setContent(chatMsg.getContent());
            message.setType(MessageType.valueOf(chatMsg.getType()));

            // Nếu cần, có thể set receiver từ thông tin khác (ví dụ: từ MessageRequest) nếu mở rộng chức năng
            Message savedMessage = messageService.saveMessage(message);

            // Broadcast tới tất cả client subscribe /topic/messages (hoặc thay đổi theo kênh riêng nếu cần)
            messagingTemplate.convertAndSend("/topic/messages", savedMessage);
            System.out.println("📤 Gửi tin nhắn tới /topic/messages: " + savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // API lấy tất cả tin nhắn giữa 2 người dùng (chat 1-1)
    @GetMapping("/{user1Id}/{user2Id}")
    public ResponseObject getMessagesBetweenUsers(@PathVariable Long user1Id, @PathVariable Long user2Id) {
        try {
            List<Message> messages = messageService.getMessagesBetweenUsers(user1Id, user2Id);
            return new ResponseObject("success", "Messages fetched successfully", messages);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseObject("error", "Failed to fetch messages", null);
        }
    }
    // Endpoint lấy danh sách cuộc trò chuyện của user (chat 1-1)
@GetMapping("/conversations/{userId}")
public ResponseObject getConversations(@PathVariable Long userId) {
    try {
        // Lấy tất cả tin nhắn có liên quan đến user (gửi hoặc nhận)
        List<Message> messages = messageService.getMessagesByUserId(userId);
        // Nhóm tin nhắn theo đối tác chat
        Map<Long, Map<String, Object>> conversationsMap = new HashMap<>();
        System.out.println("🔍 Lấy cuộc trò chuyện của user: " );
        for (Message msg : messages) {
            // Xác định đối tác: nếu user là sender thì đối tác là receiver, ngược lại
            Long partnerId = userId.equals(msg.getSenderId()) 
                    ? msg.getReceiverId() 
                    : msg.getSenderId();
            
            // Lấy thông tin đối tác
            User partner = userService.findById(partnerId).orElse(null);
            if (partner == null) continue;
            
            // Nếu chưa có cuộc hội thoại, khởi tạo
            if (!conversationsMap.containsKey(partnerId)) {
                Map<String, Object> conv = new HashMap<>();
                conv.put("id", partnerId);
                conv.put("name", partner.getUsername());
                conv.put("avatar", partner.getAvatar());
                conv.put("message", msg.getContent());
                conv.put("time", msg.getSentAt());
                conv.put("online", false); // Nếu có logic online, bạn có thể cập nhật ở đây
                conversationsMap.put(partnerId, conv);
            } else {
                // Cập nhật tin nhắn mới nhất nếu cần
                Map<String, Object> conv = conversationsMap.get(partnerId);
                // So sánh thời gian để xác định tin nhắn mới hơn
                LocalDateTime existingTime = (LocalDateTime) conv.get("time");
                if (msg.getSentAt().isAfter(existingTime)) {
                    conv.put("message", msg.getContent());
                    conv.put("time", msg.getSentAt());
                }
            }
        }
        List<Map<String, Object>> convList = new ArrayList<>(conversationsMap.values());
        return new ResponseObject("success", "Conversations fetched successfully", convList);
    } catch (Exception e) {
        e.printStackTrace();
        return new ResponseObject("error", "Failed to fetch conversations", null);
    }
}

}