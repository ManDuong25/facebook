package backend.backend.controller;

import backend.backend.model.ChatRoom;
import backend.backend.model.ChatRoomMember;
import backend.backend.model.User;
import backend.backend.service.ChatRoomMemberService;
import backend.backend.service.ChatRoomService;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-room-members")
@CrossOrigin(origins = "*")
public class ChatRoomMemberController {
    @Autowired
    private ChatRoomMemberService memberService;

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private UserService userService;

    @PostMapping("/rooms/{roomId}/users/{userId}")
    public ResponseEntity<ChatRoomMember> addMember(
            @PathVariable Long roomId,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "MEMBER") ChatRoomMember.Role role) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            User user = userService.getUserById(userId);
            ChatRoomMember member = memberService.addMember(room, user, role);
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long memberId) {
        try {
            memberService.removeMember(memberId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{memberId}/role")
    public ResponseEntity<ChatRoomMember> updateMemberRole(
            @PathVariable Long memberId,
            @RequestParam ChatRoomMember.Role newRole) {
        try {
            memberService.updateMemberRole(memberId, newRole);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<List<ChatRoomMember>> getRoomMembers(@PathVariable Long roomId) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            List<ChatRoomMember> members = memberService.getRoomMembers(room);
            return ResponseEntity.ok(members);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ChatRoomMember>> getUserRooms(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            List<ChatRoomMember> rooms = memberService.getUserRooms(user);
            return ResponseEntity.ok(rooms);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rooms/{roomId}/admins")
    public ResponseEntity<List<ChatRoomMember>> getRoomAdmins(@PathVariable Long roomId) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            List<ChatRoomMember> admins = memberService.getRoomAdmins(room);
            return ResponseEntity.ok(admins);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isMember(
            @RequestParam Long roomId,
            @RequestParam Long userId) {
        try {
            ChatRoom room = chatRoomService.getChatRoomById(roomId);
            User user = userService.getUserById(userId);
            boolean isMember = memberService.isMember(room, user);
            return ResponseEntity.ok(isMember);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{memberId}/last-seen")
    public ResponseEntity<Void> updateLastSeen(@PathVariable Long memberId) {
        try {
            memberService.updateLastSeen(memberId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}