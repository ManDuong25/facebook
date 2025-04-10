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
     * @param userId ID người dùng chính
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
        
        // Lấy thông tin người dùng
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 1 không tồn tại."));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng 2 không tồn tại."));
        
        // Tạo mối quan hệ bạn bè
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
     * Lấy danh sách gợi ý bạn bè
     */
    public List<User> getFriendSuggestions(Long userId) {
        // Lấy danh sách ID bạn bè hiện tại
        List<Long> friendIds = friendRepository.findFriendUsersByUserId(userId)
                .stream()
                .map(User::getId)
                .collect(Collectors.toList());
        
        // Thêm ID người dùng hiện tại vào danh sách loại trừ
        friendIds.add(userId);
        
        // Lấy người dùng hiện tại từ repository
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + userId));
        
        // Lấy danh sách ID người dùng đã gửi lời mời kết bạn
        List<Long> sentRequestIds = friendRequestRepository.findBySender(currentUser)
                .stream()
                .map(request -> request.getReceiver().getId())
                .collect(Collectors.toList());
        
        // Lấy danh sách ID người dùng đã nhận lời mời kết bạn
        List<Long> receivedRequestIds = friendRequestRepository.findByReceiver(currentUser)
                .stream()
                .map(request -> request.getSender().getId())
                .collect(Collectors.toList());
        
        // Loại bỏ tất cả ID cần loại trừ
        List<Long> excludeIds = new ArrayList<>(friendIds);
        excludeIds.addAll(sentRequestIds);
        excludeIds.addAll(receivedRequestIds);
        
        // Lấy tất cả người dùng, ngoại trừ các ID đã loại trừ, giới hạn 20 gợi ý
        return userRepository.findAll().stream()
                .filter(user -> !excludeIds.contains(user.getId()))
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
        
        if (request.getStatus() != FriendRequest.FriendRequestStatus.pending) {
            throw new IllegalStateException("Lời mời kết bạn đã được xử lý trước đó.");
        }
        
        // Cập nhật trạng thái lời mời thành accepted
        request.setStatus(FriendRequest.FriendRequestStatus.accepted);
        friendRequestRepository.save(request);
        
        // Gửi thông báo cho người gửi lời mời
        notificationService.createNotification(
            request.getSender().getId(),
            Notification.NotificationType.FRIEND_ACCEPT,
            request.getId(),
            request.getReceiver().getFirstName() + " " + request.getReceiver().getLastName() + " đã chấp nhận lời mời kết bạn của bạn"
        );
        
        // Tạo mối quan hệ bạn bè
        return createFriendship(request.getSender().getId(), request.getReceiver().getId());
    }
} 