package backend.backend.service;

import backend.backend.model.User;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * Xác thực đăng nhập admin
     * 
     * @param username Tên đăng nhập
     * @param password Mật khẩu
     * @return Map chứa thông tin đăng nhập và token nếu thành công, null nếu thất bại
     */
    public Map<String, Object> authenticateAdmin(String username, String password) {
        // Tìm user theo username
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        // Kiểm tra user có tồn tại không
        if (userOpt.isEmpty()) {
            return null;
        }
        
        User user = userOpt.get();
        
        // Kiểm tra user có phải là admin không
        if (!user.isAdmin()) {
            return null;
        }
        
        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return null;
        }
        
        // Tạo response
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("avatar", user.getAvatar());
        response.put("isAdmin", user.isAdmin());
        
        // Trong thực tế, bạn có thể tạo JWT token ở đây
        // String token = jwtTokenProvider.generateToken(user);
        // response.put("token", token);
        
        return response;
    }
    
    /**
     * Tạo tài khoản admin mới
     * 
     * @param user Thông tin user admin
     * @return User đã được tạo
     */
    public User createAdmin(User user) {
        user.setIsAdmin(true);
        
        // Mã hóa mật khẩu
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        return userRepository.save(user);
    }
}
