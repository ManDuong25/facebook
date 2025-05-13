package backend.backend.controller;

import backend.backend.model.ChatRoom;
import backend.backend.model.ChatRoomMessage;
import backend.backend.model.User;
import backend.backend.service.ChatRoomMessageService;
import backend.backend.service.ChatRoomService;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/api/chat-room-messages")
@CrossOrigin(origins = "*")
public class ChatRoomMessageController {
    @Autowired
    private ChatRoomMessageService messageService;

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/rooms/{roomId}/users/{userId}")
    public ResponseEntity<ChatRoomMessage> sendMessage(
            @PathVariable Long roomId,
            @PathVariable Long userId,
            @RequestParam String content,
            @RequestParam(defaultValue = "TEXT") ChatRoomMessage.MessageType messageType) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            User sender = userService.getUserById(userId);
            ChatRoomMessage message = messageService.sendMessage(room, sender, content, messageType);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @MessageMapping("/chat-rooms")
    public void handleChatRoomMessage(ChatRoomMessage message) {
        try {
            User sender = userService.getUserById(message.getSender().getId());
            if (sender == null) {
                System.err.println("[WebSocket] Sender not found: " + message.getSender().getId());
                return;
            }

            ChatRoom room = chatRoomService.getChatRoomById(message.getRoom().getId());
            if (room == null) {
                System.err.println("[WebSocket] Room not found: " + message.getRoom().getId());
                return;
            }
            System.out.println("[WebSocket] Found room: " + room.getName());

            // Cập nhật thông tin đầy đủ cho tin nhắn
            message.setSender(sender);
            message.setRoom(room);
            message.setCreatedAt(LocalDateTime.now());
            message.setDeleted(false);

            // Lưu tin nhắn vào database
            ChatRoomMessage savedMessage = messageService.saveMessage(message);

            // Gửi tin nhắn đến tất cả client trong phòng chat
            String destination = "/topic/chat-rooms/" + room.getId();

            // Tạo một bản sao của tin nhắn với thông tin đầy đủ
            ChatRoomMessage messageToSend = new ChatRoomMessage();
            messageToSend.setId(savedMessage.getId());
            messageToSend.setContent(savedMessage.getContent());
            messageToSend.setMessageType(savedMessage.getMessageType());
            messageToSend.setCreatedAt(savedMessage.getCreatedAt());
            messageToSend.setDeleted(savedMessage.isDeleted());

            // Set sender info
            User senderInfo = new User();
            senderInfo.setId(sender.getId());
            senderInfo.setFirstName(sender.getFirstName());
            senderInfo.setLastName(sender.getLastName());
            senderInfo.setAvatar(sender.getAvatar());
            messageToSend.setSender(senderInfo);

            // Set room info
            ChatRoom roomInfo = new ChatRoom();
            roomInfo.setId(room.getId());
            roomInfo.setName(room.getName());
            roomInfo.setAvatar(room.getAvatar());
            messageToSend.setRoom(roomInfo);

            messagingTemplate.convertAndSend(destination, messageToSend);
            System.out.println("[WebSocket] Message sent successfully");
        } catch (Exception e) {
            System.err.println("[WebSocket] Error handling message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        try {
            messageService.deleteMessage(messageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<List<ChatRoomMessage>> getRoomMessages(@PathVariable Long roomId) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            List<ChatRoomMessage> messages = messageService.getRoomMessages(room);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rooms/{roomId}/paginated")
    public ResponseEntity<Page<ChatRoomMessage>> getRoomMessagesPaginated(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ChatRoomMessage> messages = messageService.getRoomMessagesPaginated(room, pageRequest);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ChatRoomMessage>> getUserMessages(@PathVariable Long userId) {
        try {
            User sender = userService.getUserById(userId);
            List<ChatRoomMessage> messages = messageService.getUserMessages(sender);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rooms/{roomId}/type/{messageType}")
    public ResponseEntity<List<ChatRoomMessage>> getRoomMessagesByType(
            @PathVariable Long roomId,
            @PathVariable ChatRoomMessage.MessageType messageType) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            List<ChatRoomMessage> messages = messageService.getRoomMessagesByType(room, messageType);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<ChatRoomMessage> getMessageById(@PathVariable Long messageId) {
        try {
            ChatRoomMessage message = messageService.getMessageById(messageId);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{messageId}/mark-deleted")
    public ResponseEntity<Void> markMessageAsDeleted(@PathVariable Long messageId) {
        try {
            messageService.markMessageAsDeleted(messageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}