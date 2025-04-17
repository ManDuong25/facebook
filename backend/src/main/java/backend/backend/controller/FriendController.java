package backend.backend.controller;

import backend.backend.model.Friend;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.FriendService;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @Autowired
    private UserService userService;

    // Get all friends of a user
    @GetMapping("/{userId}")
    public ResponseEntity<?> getFriends(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(friendService.getFriendsByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving friends: " + e.getMessage()));
        }
    }

    // Create friendship
    @PostMapping("/create")
    public ResponseEntity<?> createFriendship(@RequestBody Map<String, Object> request) {
        try {
            Long user1Id = Long.valueOf(request.get("user1Id").toString());
            Long user2Id = Long.valueOf(request.get("user2Id").toString());
            return ResponseEntity.ok(friendService.createFriendship(user1Id, user2Id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating friendship: " + e.getMessage()));
        }
    }

    // Check if two users are friends
    @GetMapping("/check")
    public ResponseEntity<?> checkFriendship(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {
        try {
            boolean areFriends = friendService.checkFriendship(user1Id, user2Id);
            return ResponseEntity.ok(Map.of("areFriends", areFriends));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking friendship: " + e.getMessage()));
        }
    }

    // Kiểm tra trạng thái kết bạn hàng loạt
    @PostMapping("/status-batch")
    public ResponseEntity<?> checkFriendshipStatusBatch(@RequestBody Map<String, Object> request) {
        try {
            // Debug information
            System.out.println("===== CHECK FRIENDSHIP BATCH STATUS =====");
            System.out.println("Request received: " + request);

            // Kiểm tra xem request có chứa userId không
            if (request.get("userId") == null) {
                System.out.println("userId is null in the request");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "userId không được để trống"));
            }

            // Lấy các tham số từ request body
            Long userId = Long.valueOf(request.get("userId").toString());
            System.out.println("userId: " + userId);

            // Kiểm tra targetUserIds
            if (request.get("targetUserIds") == null) {
                System.out.println("targetUserIds is null in the request");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "targetUserIds không được để trống"));
            }

            // Thay thế cách ép kiểu trực tiếp bằng chuyển đổi từng phần tử
            @SuppressWarnings("unchecked")
            List<?> tempList = (List<?>) request.get("targetUserIds");
            List<Long> targetUserIds = new ArrayList<>();
            for (Object item : tempList) {
                targetUserIds.add(Long.valueOf(item.toString()));
            }
            System.out.println("targetUserIds: " + targetUserIds);

            // Validate input
            if (userId == null || targetUserIds == null || targetUserIds.isEmpty()) {
                System.out.println("Invalid input: userId=" + userId + ", targetUserIds=" + targetUserIds);
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "userId và targetUserIds không được để trống"));
            }

            // Thực hiện kiểm tra trạng thái kết bạn hàng loạt
            List<Map<String, Object>> results = friendService.checkFriendshipBatchStatus(userId, targetUserIds);
            System.out.println("Results: " + results);
            System.out.println("=======================================");

            return ResponseEntity.ok(new ResponseObject("success", "Friendship status checked", results));
        } catch (Exception e) {
            System.out.println("Error in checkFriendshipStatusBatch: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking batch friendship status: " + e.getMessage()));
        }
    }

    // Remove friendship
    @DeleteMapping("/{user1Id}/{user2Id}")
    public ResponseEntity<?> removeFriendship(
            @PathVariable Long user1Id,
            @PathVariable Long user2Id) {
        try {
            friendService.removeFriendship(user1Id, user2Id);
            return ResponseEntity.ok(Map.of("message", "Friendship removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error removing friendship: " + e.getMessage()));
        }
    }

    // Get friend suggestions for a user
    @GetMapping("/suggestions/{userId}")
    public ResponseEntity<?> getFriendSuggestions(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(friendService.getFriendSuggestions(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving friend suggestions: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách bạn chung giữa hai người dùng
     */
    @GetMapping("/mutual")
    public ResponseEntity<?> getMutualFriends(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {
        try {
            // Kiểm tra user1Id và user2Id phải khác nhau
            if (user1Id.equals(user2Id)) {
                Map<String, Object> response = new java.util.HashMap<>();
                response.put("message", "user1Id và user2Id không được giống nhau");
                response.put("EC", -2);
                return ResponseEntity.badRequest().body(response);
            }

            List<Long> mutualFriendIds = friendService.getMutualFriendIds(user1Id, user2Id);

            // Tạo đối tượng trả về
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("data", mutualFriendIds);
            response.put("count", mutualFriendIds.size());
            response.put("message", "Lấy danh sách ID bạn chung thành công");
            response.put("EC", 0);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "Lỗi khi lấy danh sách ID bạn chung: " + e.getMessage());
            response.put("EC", -1);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông tin chi tiết của các bạn chung giữa hai người dùng
     */
    @GetMapping("/mutual/details")
    public ResponseEntity<?> getMutualFriendsDetails(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {
        try {
            // Kiểm tra user1Id và user2Id phải khác nhau
            if (user1Id.equals(user2Id)) {
                Map<String, Object> response = new java.util.HashMap<>();
                response.put("message", "user1Id và user2Id không được giống nhau");
                response.put("EC", -2);
                return ResponseEntity.badRequest().body(response);
            }

            List<User> mutualFriends = friendService.getMutualFriendDetails(user1Id, user2Id);

            // Tạo đối tượng trả về
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("data", mutualFriends);
            response.put("count", mutualFriends.size());
            response.put("message", "Lấy thông tin chi tiết bạn chung thành công");
            response.put("EC", 0);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "Lỗi khi lấy thông tin chi tiết bạn chung: " + e.getMessage());
            response.put("EC", -1);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}