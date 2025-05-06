package backend.backend.service;

import backend.backend.model.Friend;
import backend.backend.model.FriendRequest;
import backend.backend.model.Notification;
import backend.backend.model.User;
import backend.backend.repository.FriendRepository;
import backend.backend.repository.FriendRequestRepository;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FriendService {

    @Autowired
    private FriendRepository friendRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Lấy danh sách bạn bè của người dùng
     */
    public List<User> getFriendsByUserId(Long userId) {
        return friendRepository.findFriendUsersByUserId(userId);
    }

    /**
     * Kiểm tra mối quan hệ bạn bè
     */
    public boolean checkFriendship(Long user1Id, Long user2Id) {
        return friendRepository.existsFriendship(user1Id, user2Id);
    }

    /**
     * Kiểm tra trạng thái kết bạn hàng loạt với nhiều người dùng
     * 
     * @param userId        ID người dùng chính
     * @param targetUserIds Danh sách ID người dùng cần kiểm tra
     * @return Danh sách kết quả với trạng thái kết bạn cho mỗi người dùng
     */
    public List<Map<String, Object>> checkFriendshipBatchStatus(Long userId, List<Long> targetUserIds) {
        // Lấy thông tin người dùng chính
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + userId));

        List<Map<String, Object>> results = new ArrayList<>();

        for (Long targetId : targetUserIds) {
            Map<String, Object> result = new HashMap<>();
            result.put("targetUserId", targetId);

            // Kiểm tra xem đã là bạn bè chưa
            boolean areFriends = checkFriendship(userId, targetId);
            if (areFriends) {
                result.put("status", "ACCEPTED");
                result.put("isFriend", true);
                results.add(result);
                continue;
            }

            // Tìm lời mời kết bạn từ người dùng hiện tại đến mục tiêu
            Optional<FriendRequest> sentRequest = friendRequestRepository.findPendingRequest(userId, targetId);
            if (sentRequest.isPresent()) {
                result.put("status", "PENDING");
                result.put("sender", sentRequest.get().getSender());
                result.put("receiver", sentRequest.get().getReceiver());
                result.put("requestId", sentRequest.get().getId());
                result.put("createdAt", sentRequest.get().getCreatedAt());
                results.add(result);
                continue;
            }

            // Tìm lời mời kết bạn từ mục tiêu đến người dùng hiện tại
            Optional<FriendRequest> receivedRequest = friendRequestRepository.findPendingRequest(targetId, userId);
            if (receivedRequest.isPresent()) {
                result.put("status", "RECEIVED");
                result.put("sender", receivedRequest.get().getSender());
                result.put("receiver", receivedRequest.get().getReceiver());
                result.put("requestId", receivedRequest.get().getId());
                result.put("createdAt", receivedRequest.get().getCreatedAt());
                results.add(result);
                continue;
            }

            // Nếu không có mối quan hệ
            result.put("status", "NONE");
            results.add(result);
        }

        return results;
    }

    /**
     * Tạo mối quan hệ bạn bè giữa hai người dùng
     */
    @Transactional
    public Friend createFriendship(Long user1Id, Long user2Id) {
        // Kiểm tra xem đã là bạn bè chưa
        if (friendRepository.existsFriendship(user1Id, user2Id)) {
            throw new IllegalStateException("Hai người dùng đã là bạn bè.");
        }

        if (user1Id == user2Id) {
            throw new IllegalArgumentException("Không thể tạo mối quan hệ bạn bè với chính mình.");
        }

        // Lấy thông tin người dùng
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 1 không tồn tại."));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 2 không tồn tại."));

        // Tạo mối quan hệ bạn bè mới
        Friend friendship = new Friend();
        friendship.setUser1(user1);
        friendship.setUser2(user2);
        friendship.setSince(LocalDateTime.now());

        return friendRepository.save(friendship);
    }

    /**
     * Xóa mối quan hệ bạn bè
     */
    @Transactional
    public boolean removeFriendship(Long user1Id, Long user2Id) {
        Optional<Friend> friendshipOpt = friendRepository.findFriendshipBetweenUsers(user1Id, user2Id);

        if (friendshipOpt.isPresent()) {
            friendRepository.delete(friendshipOpt.get());
            return true;
        }

        return false;
    }

    /**
     * Lấy danh sách gợi ý bạn bè (đơn giản hóa: chỉ lấy những người chưa kết bạn)
     */
    public List<User> getFriendSuggestions(Long userId) {
        // Lấy danh sách ID bạn bè hiện tại
        List<Long> friendIds = friendRepository.findFriendUsersByUserId(userId)
                .stream()
                .map(User::getId)
                .collect(Collectors.toList());

        // Thêm ID người dùng hiện tại vào danh sách loại trừ
        friendIds.add(userId);

        // Lấy tất cả người dùng, ngoại trừ bản thân và bạn bè, giới hạn 20 gợi ý
        return userRepository.findAll().stream()
                .filter(user -> !friendIds.contains(user.getId()))
                .limit(20)
                .collect(Collectors.toList());
    }

    /**
     * Xử lý chấp nhận lời mời kết bạn
     */
    @Transactional
    public Friend acceptFriendRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời kết bạn không tồn tại."));

        if (request.getStatus() != FriendRequest.FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Lời mời kết bạn đã được xử lý trước đó.");
        }

        // Cập nhật trạng thái lời mời thành accepted
        request.setStatus(FriendRequest.FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        // Gửi thông báo cho người gửi lời mời
        notificationService.createNotification(
                request.getSender().getId(),
                Notification.NotificationType.FRIEND_ACCEPT,
                request.getId(),
                request.getReceiver().getFirstName() + " " + request.getReceiver().getLastName()
                        + " đã chấp nhận lời mời kết bạn của bạn");

        // Tạo mối quan hệ bạn bè
        return createFriendship(request.getSender().getId(), request.getReceiver().getId());
    }

    /**
     * Lấy danh sách ID của các bạn chung giữa hai người dùng
     */
    public List<Long> getMutualFriendIds(Long userId1, Long userId2) {
        // Kiểm tra user1Id và user2Id phải khác nhau
        if (userId1.equals(userId2)) {
            throw new IllegalArgumentException("userId1 và userId2 không được giống nhau");
        }

        // Lấy danh sách mối quan hệ bạn bè của cả hai người dùng
        List<Friend> friendshipsOfUser1 = friendRepository.findFriendsByUserId(userId1);
        List<Friend> friendshipsOfUser2 = friendRepository.findFriendsByUserId(userId2);

        // Trích xuất ID của tất cả bạn bè của người dùng 1
        List<Long> friendIdsOfUser1 = new ArrayList<>();
        for (Friend friendship : friendshipsOfUser1) {
            if (friendship.getUser1().getId().equals(userId1)) {
                friendIdsOfUser1.add(friendship.getUser2().getId());
            } else {
                friendIdsOfUser1.add(friendship.getUser1().getId());
            }
        }

        // Trích xuất ID của tất cả bạn bè của người dùng 2
        List<Long> friendIdsOfUser2 = new ArrayList<>();
        for (Friend friendship : friendshipsOfUser2) {
            if (friendship.getUser1().getId().equals(userId2)) {
                friendIdsOfUser2.add(friendship.getUser2().getId());
            } else {
                friendIdsOfUser2.add(friendship.getUser1().getId());
            }
        }

        // Tìm phần giao của hai danh sách (bạn chung)
        List<Long> mutualFriendIds = new ArrayList<>();
        for (Long friendId : friendIdsOfUser1) {
            if (friendIdsOfUser2.contains(friendId)) {
                mutualFriendIds.add(friendId);
            }
        }

        return mutualFriendIds;
    }

    /**
     * Lấy thông tin chi tiết của các bạn chung giữa hai người dùng
     */
    public List<User> getMutualFriendDetails(Long userId1, Long userId2) {
        // Kiểm tra user1Id và user2Id phải khác nhau
        if (userId1.equals(userId2)) {
            throw new IllegalArgumentException("userId1 và userId2 không được giống nhau");
        }

        List<Long> mutualFriendIds = getMutualFriendIds(userId1, userId2);
        return userRepository.findAllById(mutualFriendIds);
    }
}