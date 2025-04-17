package backend.backend.repository;

import backend.backend.model.Friend;
import backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {
    
    // Tìm tất cả bạn bè của một người dùng
    @Query("SELECT f FROM Friend f WHERE f.user1.id = :userId OR f.user2.id = :userId")
    List<Friend> findFriendsByUserId(@Param("userId") Long userId);
    
    // Tìm tất cả bạn bè của một người dùng và trả về user đối tác của mối quan hệ
    // Commented out due to casting issues in Hibernate
    // @Query("SELECT CASE WHEN f.user1.id = :userId THEN f.user2 ELSE f.user1 END FROM Friend f WHERE f.user1.id = :userId OR f.user2.id = :userId")
    // List<User> findFriendUsersByUserId(@Param("userId") Long userId);
    
    // Sử dụng native query thay thế để tránh lỗi casting và thêm DISTINCT để tránh trùng lặp
    @Query(value = "SELECT DISTINCT u.* FROM users u " +
            "JOIN friends f ON (u.id = f.user1_id OR u.id = f.user2_id) " +
            "WHERE (f.user1_id = :userId OR f.user2_id = :userId) " +
            "AND u.id != :userId", nativeQuery = true)
    List<User> findFriendUsersByUserId(@Param("userId") Long userId);
    
    // Kiểm tra xem hai người dùng có phải là bạn bè không (một chiều)
    @Query("SELECT COUNT(f) > 0 FROM Friend f WHERE " +
           "(f.user1.id = LEAST(:user1Id, :user2Id) AND f.user2.id = GREATEST(:user1Id, :user2Id))")
    boolean existsFriendship(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
    
    // Tìm mối quan hệ bạn bè giữa hai người dùng (một chiều)
    @Query("SELECT f FROM Friend f WHERE " +
           "(f.user1.id = LEAST(:user1Id, :user2Id) AND f.user2.id = GREATEST(:user1Id, :user2Id))")
    Optional<Friend> findFriendshipBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
} 