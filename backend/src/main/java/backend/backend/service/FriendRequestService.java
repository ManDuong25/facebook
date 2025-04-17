package backend.backend.service;

import backend.backend.model.Comment;
import backend.backend.model.FriendRequest;
import backend.backend.model.Notification;
import backend.backend.model.Post;
import backend.backend.model.User;
import backend.backend.repository.CommentRepository;
import backend.backend.repository.FriendRequestRepository;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FriendRequestService {

    @Autowired
    private FriendRequestRepository friendRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Gửi yêu cầu kết bạn
     */
    @Transactional
    public FriendRequest sendFriendRequest(Long senderId, Long receiverId) {
        // Kiểm tra người gửi và người nhận có tồn tại
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Người gửi không tồn tại."));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Người nhận không tồn tại."));
        
        // Kiểm tra nếu đã gửi lời mời kết bạn
        if (existsFriendRequest(senderId, receiverId)) {
            throw new IllegalStateException("Đã gửi lời mời kết bạn trước đó.");
        }
        
        // Tạo lời mời kết bạn mới
        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(FriendRequest.FriendRequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        
        FriendRequest savedRequest = friendRequestRepository.save(request);
        
        // Tạo thông báo cho người nhận với tham số content
        String notificationContent = "Bạn có một lời mời kết bạn mới từ " + sender.getFirstName() + " " + sender.getLastName();
        notificationService.createNotification(
            receiver.getId(),
            Notification.NotificationType.FRIEND_REQUEST,
            savedRequest.getId(),
            notificationContent
        );
        
        return savedRequest;
    }

    /**
     * Kiểm tra lời mời kết bạn đã tồn tại giữa hai người dùng
     */
    public boolean existsFriendRequest(Long senderId, Long receiverId) {
        User sender = new User();
        sender.setId(senderId);
        
        User receiver = new User();
        receiver.setId(receiverId);
        
        List<FriendRequest> sentRequests = friendRequestRepository.findBySender(sender);
        
        return sentRequests.stream()
                .anyMatch(req -> req.getReceiver().getId().equals(receiverId) && 
                        req.getStatus() == FriendRequest.FriendRequestStatus.PENDING);
    }

    /**
     * Lấy danh sách yêu cầu kết bạn gửi đi của một user
     */
    public List<FriendRequest> getRequestsBySender(Long senderId) {
        User sender = new User();
        sender.setId(senderId);
        return friendRequestRepository.findBySender(sender);
    }

    /**
     * Lấy danh sách yêu cầu kết bạn nhận được của một user
     */
    public List<FriendRequest> getRequestsByReceiver(Long receiverId) {
        User receiver = new User();
        receiver.setId(receiverId);
        return friendRequestRepository.findByReceiver(receiver);
    }

    /**
     * Cập nhật trạng thái yêu cầu kết bạn
     */
    @Transactional
    public FriendRequest updateFriendRequest(Long id, FriendRequest.FriendRequestStatus status) {
        return friendRequestRepository.findById(id)
                .map(existingRequest -> {
                    existingRequest.setStatus(status);
                    return friendRequestRepository.save(existingRequest);
                })
                .orElseThrow(() -> new IllegalArgumentException("Lời mời kết bạn không tồn tại."));
    }

    /**
     * Xoá yêu cầu kết bạn
     */
    @Transactional
    public boolean deleteFriendRequest(Long id) {
        Optional<FriendRequest> requestOpt = friendRequestRepository.findById(id);
        if(requestOpt.isEmpty()) {
            return false;
        }
        
        FriendRequest request = requestOpt.get();
        if(request.getStatus() != FriendRequest.FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Không thể xóa lời mời đã được chấp nhận hoặc từ chối.");
        }
        
        friendRequestRepository.deleteById(id);
        return true;
    }
    
    /**
     * Từ chối lời mời kết bạn
     */
    @Transactional
    public FriendRequest rejectFriendRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Lời mời kết bạn không tồn tại."));
        
        if (request.getStatus() != FriendRequest.FriendRequestStatus.PENDING) {
            throw new IllegalStateException("Lời mời kết bạn đã được xử lý trước đó.");
        }
        
        request.setStatus(FriendRequest.FriendRequestStatus.REJECTED);
        return friendRequestRepository.save(request);
    }

    /**
     * Tìm lời mời kết bạn theo ID
     */
    public Optional<FriendRequest> findById(Long requestId) {
        return friendRequestRepository.findById(requestId);
    }
}
