package backend.backend.controller;

import backend.backend.model.ChatRoom;
import backend.backend.service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-rooms")
@CrossOrigin(origins = "*")
public class ChatRoomController {
    @Autowired
    private ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<ChatRoom> createChatRoom(@RequestBody ChatRoom chatRoom) {
        try {
            ChatRoom createdRoom = chatRoomService.createChatRoom(chatRoom);
            return ResponseEntity.ok(createdRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChatRoom> updateChatRoom(@PathVariable Long id, @RequestBody ChatRoom chatRoomDetails) {
        try {
            ChatRoom updatedRoom = chatRoomService.updateChatRoom(id, chatRoomDetails);
            return ResponseEntity.ok(updatedRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable Long id) {
        try {
            chatRoomService.deleteChatRoom(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatRoom> getChatRoomById(@PathVariable Long id) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(id);
            return ResponseEntity.ok(room);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllChatRooms() {
        List<ChatRoom> rooms = chatRoomService.getAllChatRooms();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ChatRoom>> searchChatRooms(@RequestParam String name) {
        List<ChatRoom> rooms = chatRoomService.searchChatRooms(name);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/check-name")
    public ResponseEntity<Boolean> checkRoomName(@RequestParam String name) {
        boolean exists = chatRoomService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
}
