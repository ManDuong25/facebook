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
            User user1 = new User(null, "john_doe", "john@example.com", 
                passwordEncoder.encode("password123"), 
                "avatar1.png", "cover1.jpg", LocalDateTime.now(), 
                "John", "Doe", LocalDate.of(1995, 5, 20), 
                "Male", "Software Engineer", "MIT", 
                "New York", "Boston", "Lập trình viên yêu thích AI");
                
            User user2 = new User(null, "jane_doe", "jane@example.com", 
                passwordEncoder.encode("password456"), 
                "avatar2.png", "cover2.jpg", LocalDateTime.now(), 
                "Jane", "Doe", LocalDate.of(1997, 8, 15), 
                "Female", "Doctor", "Harvard", 
                "Los Angeles", "Chicago", "Bác sĩ tận tâm");
                
            User user3 = new User(null, "michael_smith", "michael@example.com", 
                passwordEncoder.encode("password789"), 
                "avatar3.png", "cover3.jpg", LocalDateTime.now(), 
                "Michael", "Smith", LocalDate.of(1992, 3, 10), 
                "Male", "Designer", "Stanford", 
                "San Francisco", "Seattle", "Đam mê thiết kế sáng tạo");
                
            User user4 = new User(null, "emily_johnson", "emily@example.com", 
                passwordEncoder.encode("password999"), 
                "avatar4.png", "cover4.jpg", LocalDateTime.now(), 
                "Emily", "Johnson", LocalDate.of(1994, 6, 25), 
                "Female", "Lawyer", "Yale", 
                "Houston", "Dallas", "Luật sư chuyên nghiệp");
            
            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);
            userRepository.save(user4);
        }
    }
}
