package backend.backend.service;

import backend.backend.model.User;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Lưu user mới hoặc cập nhật user đã tồn tại
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Kiểm tra xem email đã tồn tại chưa
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Tìm user bằng ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Tìm user bằng email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Lấy tất cả user
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // Xóa user theo ID
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }
}
