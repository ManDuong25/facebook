package backend.backend.controller;

import backend.backend.model.FriendRequest;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.FriendRequestService;
import backend.backend.service.FriendService;
import backend.backend.service.UserService;

import java.util.Map;
import java.util.HashMap;
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
            Map<String, Object> response = new HashMap<>();
            response.put("data", created);
            response.put("message", "Gửi lời mời kết bạn thành công");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("EC", -1);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Lấy danh sách yêu cầu kết bạn đã gửi của một user
    @GetMapping("/sent/{userId}")
    public ResponseEntity<?> getRequestsSent(@PathVariable Long userId) {
        try {
            List<?> requests = friendRequestService.getRequestsBySender(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("data", requests);
            response.put("message", "Lấy danh sách lời mời đã gửi thành công");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Error retrieving sent requests: " + e.getMessage());
            response.put("EC", -2);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Lấy danh sách yêu cầu kết bạn nhận được của một user
    @GetMapping("/received/{userId}")
    public ResponseEntity<?> getRequestsReceived(@PathVariable Long userId) {
        try {
            List<?> requests = friendRequestService.getRequestsByReceiver(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("data", requests);
            response.put("message", "Lấy danh sách lời mời nhận được thành công");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Error retrieving received requests: " + e.getMessage());
            response.put("EC", -3);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Chấp nhận yêu cầu kết bạn
    @PostMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(
            @PathVariable Long requestId,
            @RequestParam Long currentUserId) {
        try {
            // Kiểm tra xem lời mời tồn tại không
            Optional<FriendRequest> requestOpt = friendRequestService.findById(requestId);
            if (requestOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Lời mời kết bạn không tồn tại");
                response.put("EC", -4);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            FriendRequest request = requestOpt.get();

            // Kiểm tra xem người gọi API có phải là người nhận lời mời không
            if (!request.getReceiver().getId().equals(currentUserId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Bạn không có quyền chấp nhận lời mời này");
                response.put("EC", -5);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Chấp nhận lời mời
            friendService.acceptFriendRequest(requestId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chấp nhận lời mời kết bạn thành công");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("EC", -6);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Từ chối yêu cầu kết bạn
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(
            @PathVariable Long requestId,
            @RequestParam Long currentUserId) {
        try {
            // Kiểm tra xem lời mời tồn tại không
            Optional<FriendRequest> requestOpt = friendRequestService.findById(requestId);
            if (requestOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Lời mời kết bạn không tồn tại");
                response.put("EC", -7);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            FriendRequest request = requestOpt.get();

            // Kiểm tra xem người gọi API có phải là người nhận lời mời không
            if (!request.getReceiver().getId().equals(currentUserId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Bạn không có quyền từ chối lời mời này");
                response.put("EC", -8);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Từ chối lời mời
            friendRequestService.rejectFriendRequest(requestId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Từ chối lời mời kết bạn thành công");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("EC", -9);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Xoá yêu cầu kết bạn
    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> deleteFriendRequest(
            @PathVariable Long requestId,
            @RequestParam Long currentUserId) {
        try {
            // Kiểm tra xem lời mời tồn tại không
            Optional<FriendRequest> requestOpt = friendRequestService.findById(requestId);
            if (requestOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Lời mời kết bạn không tồn tại");
                response.put("EC", -10);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            FriendRequest request = requestOpt.get();

            // Kiểm tra xem người gọi API có phải là người gửi hoặc người nhận lời mời không
            if (!request.getSender().getId().equals(currentUserId) &&
                    !request.getReceiver().getId().equals(currentUserId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Bạn không có quyền xóa lời mời này");
                response.put("EC", -11);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Xóa lời mời
            friendRequestService.deleteFriendRequest(requestId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Xóa lời mời kết bạn thành công");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // Bắt lỗi khi lời mời đã được chấp nhận hoặc từ chối
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("EC", -12);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("EC", -13);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Kiểm tra trạng thái kết bạn giữa hai người dùng
    @GetMapping("/status")
    public ResponseEntity<?> checkFriendshipStatus(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {
        try {
            Map<String, Object> response = new HashMap<>();

            // Kiểm tra xem họ đã là bạn bè chưa
            boolean areFriends = friendService.checkFriendship(user1Id, user2Id);
            if (areFriends) {
                response.put("status", "ACCEPTED");
                response.put("message", "Đã là bạn bè");
                response.put("EC", 0);
                return ResponseEntity.ok(response);
            }

            // Kiểm tra xem có lời mời kết bạn nào đang chờ xử lý không
            boolean pendingRequest = friendRequestService.existsFriendRequest(user1Id, user2Id);
            if (pendingRequest) {
                response.put("status", "PENDING");
                response.put("message", "Đã gửi lời mời kết bạn");
                response.put("EC", 0);
                return ResponseEntity.ok(response);
            }

            boolean pendingRequestReverse = friendRequestService.existsFriendRequest(user2Id, user1Id);
            if (pendingRequestReverse) {
                response.put("status", "RECEIVED");
                response.put("message", "Đã nhận lời mời kết bạn");
                response.put("EC", 0);
                return ResponseEntity.ok(response);
            }

            response.put("status", "NONE");
            response.put("message", "Chưa có mối quan hệ");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Error checking friendship status: " + e.getMessage());
            response.put("EC", -14);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Lấy tất cả lời mời kết bạn đang pending mà người dùng hiện tại NHẬN được
    @GetMapping("/pending-received/{userId}")
    public ResponseEntity<?> getPendingRequestsReceived(@PathVariable Long userId) {
        try {
            List<FriendRequest> pendingRequests = friendRequestService.getPendingRequestsReceivedByUser(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("data", pendingRequests);
            response.put("message", "Lấy danh sách lời mời kết bạn nhận được thành công");
            response.put("EC", 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Lỗi khi lấy danh sách lời mời kết bạn: " + e.getMessage());
            response.put("EC", -15);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Tìm lời mời kết bạn giữa hai người dùng
    @GetMapping("/find")
    public ResponseEntity<?> findFriendRequest(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        try {
            Optional<FriendRequest> requestOpt = friendRequestService.findPendingRequest(senderId, receiverId);

            if (requestOpt.isPresent()) {
                FriendRequest request = requestOpt.get();
                Map<String, Object> response = new HashMap<>();
                response.put("data", request);
                response.put("message", "Tìm thấy lời mời kết bạn");
                response.put("EC", 0);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Không tìm thấy lời mời kết bạn");
                response.put("EC", -16);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Lỗi khi tìm lời mời kết bạn: " + e.getMessage());
            response.put("EC", -17);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
