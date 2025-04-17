package backend.backend.repository;
import backend.backend.model.FriendRequest;
import  backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    // Lấy tất cả yêu cầu kết bạn mà 1 user đã gửi
    List<FriendRequest> findBySender(User sender);

    // Lấy tất cả yêu cầu kết bạn mà 1 user nhận được
    List<FriendRequest> findByReceiver(User receiver);
    
    // Kiểm tra xem có tồn tại lời mời kết bạn đang chờ xử lý giữa 2 người dùng không
    @Query("SELECT CASE WHEN COUNT(fr) > 0 THEN true ELSE false END FROM FriendRequest fr " +
           "WHERE ((fr.sender.id = :senderId AND fr.receiver.id = :receiverId) OR " +
           "(fr.sender.id = :receiverId AND fr.receiver.id = :senderId)) " +
           "AND fr.status = backend.backend.model.FriendRequest$FriendRequestStatus.PENDING")
    boolean existsFriendRequest(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
    
    // Tìm lời mời kết bạn đang chờ xử lý giữa 2 người dùng
    @Query("SELECT fr FROM FriendRequest fr " +
           "WHERE fr.sender.id = :senderId AND fr.receiver.id = :receiverId " +
           "AND fr.status = backend.backend.model.FriendRequest$FriendRequestStatus.PENDING")
    Optional<FriendRequest> findPendingRequest(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
