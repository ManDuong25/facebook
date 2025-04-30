package backend.backend.repository;
import  backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    // Tìm kiếm người dùng theo tên, username, hoặc email - Cải thiện với LIKE không phân biệt chữ hoa/thường và tách từ
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);

    // Tìm kiếm chính xác người dùng theo tên hiển thị
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) = LOWER(:fullName)")
    List<User> findByExactFullName(@Param("fullName") String fullName);

    // Tìm kiếm người dùng với từng từ trong tên
    @Query("SELECT DISTINCT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :word, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :word, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :word, '%'))")
    List<User> searchUsersByWord(@Param("word") String word);

    // Đếm số người dùng được tạo sau một ngày cụ thể
    int countByCreatedAtAfter(LocalDateTime date);
}
