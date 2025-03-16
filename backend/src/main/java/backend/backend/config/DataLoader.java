package backend.backend.config;

import backend.backend.model.User;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Kiểm tra xem có người dùng với email hoặc username đã tồn tại chưa
            if (!userRepository.existsByUsername("john_doe")) {
                User user1 = new User(null, "john_doe", "john@example.com", "password123", null, LocalDateTime.now());
                userRepository.save(user1);
            }
            
            if (!userRepository.existsByUsername("jane_doe")) {
                User user2 = new User(null, "jane_doe", "jane@example.com", "password456", null, LocalDateTime.now());
                userRepository.save(user2);
            }
            
        }
    }    
}
