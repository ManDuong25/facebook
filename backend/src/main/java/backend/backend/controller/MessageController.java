package backend.backend.controller;
import backend.backend.service.UserService;
import backend.backend.model.Message;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;


    @Autowired
    private SimpMessagingTemplate messagingTemplate;  // Dùng để gửi tin nhắn qua WebSocket
    @Autowired
    private UserService userService;


    // API gửi tin nhắn - LƯU TIN NHẮN vào CSDL
    // @PostMapping("/send")
    // public ResponseObject sendMessage(@RequestBody MessageRequest messageRequest) {
    //     try {
    //         User sender = userService.findById(messageRequest.getSenderId());
    //         User receiver = userService.findById(messageRequest.getReceiverId());
    
    //         if (sender == null || receiver == null) {
    //             return new ResponseObject("error", "User not found", null);
    //         }
    
    //         Message message = new Message(sender, receiver, messageRequest.getContent());
    //         Message savedMessage = messageService.saveMessage(message);
    //         return new ResponseObject("success", "Message sent successfully", savedMessage);
    //     } catch (Exception e) {
    //         e.printStackTrace(); // In ra lỗi để dễ kiểm tra
    //         return new ResponseObject("error", "Failed to send message", null);
    //     }
    // }
    

    // WebSocket gửi tin nhắn real-time
    @MessageMapping("/chat")
    public void handleChatMessage(Message message) {
        try {
            // Lưu tin nhắn vào CSDL
            Message savedMessage = messageService.saveMessage(message);

            // Gửi tin nhắn tới người nhận qua WebSocket (Được subscribe bởi React)
            messagingTemplate.convertAndSend("/topic/messages/" + message.getReceiverId(), savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // API lấy tất cả tin nhắn giữa 2 người dùng
    @GetMapping("/{user1Id}/{user2Id}")
    public ResponseObject getMessagesBetweenUsers(@PathVariable Long user1Id, @PathVariable Long user2Id) {
        try {
            List<Message> messages = messageService.getMessagesBetweenUsers(user1Id, user2Id);
            return new ResponseObject("success", "Messages fetched successfully", messages);
        } catch (Exception e) {
            return new ResponseObject("error", "Failed to fetch messages", null);
        }
    }

    // API lấy tất cả tin nhắn của một người dùng (Cả gửi và nhận)
    // @GetMapping("/{userId}")
    // public ResponseObject getMessagesByUserId(@PathVariable Long userId) {
    //     try {
    //         List<Message> messages = messageService.getMessagesByUserId(userId);
    //         return new ResponseObject("success", "Messages fetched successfully", messages);
    //     } catch (Exception e) {
    //         return new ResponseObject("error", "Failed to fetch messages", null);
    //     }
    // }
}
