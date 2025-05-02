package backend.backend.repository;
import  backend.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findByEmail(String email);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email")
    boolean existsByEmailIncludeDeleted(@Param("email") String email);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.username = :username AND u.deletedAt IS NULL")
    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.username = :username AND u.deletedAt IS NULL")
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.id = :id AND u.deletedAt IS NULL")
    Optional<User> findByIdAndDeletedAtIsNull(@Param("id") Long id);

    // Tìm kiếm người dùng theo tên, username, hoặc email - Cải thiện với LIKE không phân biệt chữ hoa/thường và tách từ
    @Query("SELECT u FROM User u WHERE (" +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND u.deletedAt IS NULL")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);

    // Tìm kiếm chính xác người dùng theo tên hiển thị
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) = LOWER(:fullName) " +
           "AND u.deletedAt IS NULL")
    List<User> findByExactFullName(@Param("fullName") String fullName);

    // Tìm kiếm người dùng với từng từ trong tên
    @Query("SELECT DISTINCT u FROM User u WHERE (" +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :word, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :word, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :word, '%'))) " +
           "AND u.deletedAt IS NULL")
    List<User> searchUsersByWord(@Param("word") String word);

    // Đếm số người dùng được tạo sau một ngày cụ thể và chưa bị xóa
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt > :date AND u.deletedAt IS NULL")
    int countByCreatedAtAfter(@Param("date") LocalDateTime date);

    // Đếm tổng số người dùng chưa bị xóa
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL")
    long countByDeletedAtIsNull();

    // Tìm tất cả người dùng chưa bị xóa
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findAllNotDeleted();

    // Tìm tất cả người dùng chưa bị xóa với phân trang
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    Page<User> findAllNotDeleted(Pageable pageable);
}
