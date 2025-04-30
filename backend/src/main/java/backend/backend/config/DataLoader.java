package backend.backend.config;

import backend.backend.model.User;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Tạo tài khoản admin
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setAvatar("admin-avatar.png");
            admin.setCoverPhoto("admin-cover.jpg");
            admin.setCreatedAt(LocalDateTime.now());
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setDateOfBirth(LocalDate.of(1990, 1, 1));
            admin.setGender("Male");
            admin.setWork("System Administrator");
            admin.setEducation("Admin University");
            admin.setCurrentCity("Admin City");
            admin.setHometown("Admin Town");
            admin.setBio("Quản trị viên hệ thống");
            admin.setIsAdmin(true); // Đặt quyền admin

            User user1 = new User();
            user1.setUsername("john_doe");
            user1.setEmail("john@example.com");
            user1.setPassword(passwordEncoder.encode("password123"));
            user1.setAvatar("avatar1.png");
            user1.setCoverPhoto("cover1.jpg");
            user1.setCreatedAt(LocalDateTime.now());
            user1.setFirstName("John");
            user1.setLastName("Doe");
            user1.setDateOfBirth(LocalDate.of(1995, 5, 20));
            user1.setGender("Male");
            user1.setWork("Software Engineer");
            user1.setEducation("MIT");
            user1.setCurrentCity("New York");
            user1.setHometown("Boston");
            user1.setBio("Lập trình viên yêu thích AI");

            User user2 = new User();
            user2.setUsername("jane_doe");
            user2.setEmail("jane@example.com");
            user2.setPassword(passwordEncoder.encode("password456"));
            user2.setAvatar("avatar2.png");
            user2.setCoverPhoto("cover2.jpg");
            user2.setCreatedAt(LocalDateTime.now());
            user2.setFirstName("Jane");
            user2.setLastName("Doe");
            user2.setDateOfBirth(LocalDate.of(1997, 8, 15));
            user2.setGender("Female");
            user2.setWork("Doctor");
            user2.setEducation("Harvard");
            user2.setCurrentCity("Los Angeles");
            user2.setHometown("Chicago");
            user2.setBio("Bác sĩ tận tâm");

            User user3 = new User();
            user3.setUsername("michael_smith");
            user3.setEmail("michael@example.com");
            user3.setPassword(passwordEncoder.encode("password789"));
            user3.setAvatar("avatar3.png");
            user3.setCoverPhoto("cover3.jpg");
            user3.setCreatedAt(LocalDateTime.now());
            user3.setFirstName("Michael");
            user3.setLastName("Smith");
            user3.setDateOfBirth(LocalDate.of(1992, 3, 10));
            user3.setGender("Male");
            user3.setWork("Designer");
            user3.setEducation("Stanford");
            user3.setCurrentCity("San Francisco");
            user3.setHometown("Seattle");
            user3.setBio("Đam mê thiết kế sáng tạo");

            User user4 = new User();
            user4.setUsername("emily_johnson");
            user4.setEmail("emily@example.com");
            user4.setPassword(passwordEncoder.encode("password999"));
            user4.setAvatar("avatar4.png");
            user4.setCoverPhoto("cover4.jpg");
            user4.setCreatedAt(LocalDateTime.now());
            user4.setFirstName("Emily");
            user4.setLastName("Johnson");
            user4.setDateOfBirth(LocalDate.of(1994, 6, 25));
            user4.setGender("Female");
            user4.setWork("Lawyer");
            user4.setEducation("Yale");
            user4.setCurrentCity("Houston");
            user4.setHometown("Dallas");
            user4.setBio("Luật sư chuyên nghiệp");

            userRepository.save(admin); // Lưu tài khoản admin trước
            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);
            userRepository.save(user4);

            System.out.println("Đã tạo tài khoản admin mặc định:");
            System.out.println("Username: admin");
            System.out.println("Password: admin123");
        }
    }
}
