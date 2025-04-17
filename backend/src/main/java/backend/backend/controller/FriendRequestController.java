package backend.backend.controller;

import backend.backend.model.FriendRequest;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.FriendRequestService;
import backend.backend.service.FriendService;
import backend.backend.service.UserService;

import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/friend-requests")
public class FriendRequestController {

    @Autowired
    private FriendRequestService friendRequestService;

    @Autowired
    private FriendService friendService;

    @Autowired
    private UserService userService;

    // Gửi yêu cầu kết bạn
    @PostMapping
    public ResponseEntity<?> sendFriendRequest(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        try {
            FriendRequest created = friendRequestService.sendFriendRequest(senderId, receiverId);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Lấy danh sách yêu cầu kết bạn đã gửi của một user
    @GetMapping("/sent/{userId}")
    public ResponseEntity<?> getRequestsSent(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(friendRequestService.getRequestsBySender(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving sent requests: " + e.getMessage()));
        }
    }

    // Lấy danh sách yêu cầu kết bạn nhận được của một user
    @GetMapping("/received/{userId}")
    public ResponseEntity<?> getRequestsReceived(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(friendRequestService.getRequestsByReceiver(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving received requests: " + e.getMessage()));
        }
    }

    // Chấp nhận yêu cầu kết bạn
    @PostMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long requestId) {
        try {
            friendService.acceptFriendRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Friend request accepted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Từ chối yêu cầu kết bạn
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Long requestId) {
        try {
            friendRequestService.rejectFriendRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Friend request rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Xoá yêu cầu kết bạn
    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> deleteFriendRequest(@PathVariable Long requestId) {
        try {
            friendRequestService.deleteFriendRequest(requestId);
            return ResponseEntity.ok(Map.of("message", "Friend request deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Kiểm tra trạng thái kết bạn giữa hai người dùng
    @GetMapping("/status")
    public ResponseEntity<?> checkFriendshipStatus(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {
        try {
            // Kiểm tra xem họ đã là bạn bè chưa
            boolean areFriends = friendService.checkFriendship(user1Id, user2Id);
            if (areFriends) {
                return ResponseEntity.ok(Map.of("status", "FRIENDS"));
            }

            // Kiểm tra xem có lời mời kết bạn nào đang chờ xử lý không
            boolean pendingRequest = friendRequestService.existsFriendRequest(user1Id, user2Id);
            if (pendingRequest) {
                return ResponseEntity.ok(Map.of("status", "PENDING"));
            }

            boolean pendingRequestReverse = friendRequestService.existsFriendRequest(user2Id, user1Id);
            if (pendingRequestReverse) {
                return ResponseEntity.ok(Map.of("status", "RECEIVED"));
            }

            return ResponseEntity.ok(Map.of("status", "NONE"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking friendship status: " + e.getMessage()));
        }
    }
}
