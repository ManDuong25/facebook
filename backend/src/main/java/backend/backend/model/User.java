package backend.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String avatar; // Ảnh đại diện

    @Column
    private String coverPhoto; // Ảnh bìa

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Họ và Tên riêng biệt
    @Column(nullable = false)
    private String firstName;  // Tên (Ví dụ: Văn A)

    @Column(nullable = false)
    private String lastName;   // Họ (Ví dụ: Nguyễn)

    @Column(nullable = false)
    private LocalDate dateOfBirth; // Ngày sinh

    @Column(nullable = false)
    private String gender; // Giới tính (Nam, Nữ,...)

    // Công việc & Học vấn
    @Column
    private String work; // Công việc hiện tại

    @Column
    private String education; // Học vấn

    // Địa chỉ
    @Column
    private String currentCity; // Nơi đang sống

    @Column
    private String hometown; // Quê quán

    // Giới thiệu bản thân
    @Column
    private String bio; // Mô tả ngắn gọn
}
