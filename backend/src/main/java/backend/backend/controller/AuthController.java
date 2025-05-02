package backend.backend.controller;

import backend.backend.model.User;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> registrationData) {
        try {
            // Kiểm tra email đã tồn tại chưa
            String email = (String) registrationData.get("email");
            if (userService.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email đã tồn tại trong hệ thống"));
            }

            // Kiểm tra username đã tồn tại chưa
            String username = (String) registrationData.get("username");
            if (userService.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Tên người dùng đã tồn tại"));
            }

            // Tạo người dùng mới
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode((String) registrationData.get("password")));
            newUser.setFirstName((String) registrationData.get("firstName"));
            newUser.setLastName((String) registrationData.get("lastName"));

            // Chuyển đổi chuỗi ngày thành LocalDate
            String dateOfBirthStr = (String) registrationData.get("dateOfBirth");
            LocalDate dateOfBirth = LocalDate.parse(dateOfBirthStr);
            newUser.setDateOfBirth(dateOfBirth);

            newUser.setGender((String) registrationData.get("gender"));
            newUser.setCreatedAt(LocalDateTime.now());

            // Các thông tin tùy chọn
            if (registrationData.containsKey("currentCity")) {
                newUser.setCurrentCity((String) registrationData.get("currentCity"));
            }

            if (registrationData.containsKey("hometown")) {
                newUser.setHometown((String) registrationData.get("hometown"));
            }

            if (registrationData.containsKey("work")) {
                newUser.setWork((String) registrationData.get("work"));
            }

            if (registrationData.containsKey("education")) {
                newUser.setEducation((String) registrationData.get("education"));
            }

            if (registrationData.containsKey("bio")) {
                newUser.setBio((String) registrationData.get("bio"));
            }

            // Lưu người dùng mới
            User savedUser = userService.saveUser(newUser);

            // Trả về thông tin người dùng đã đăng ký (không bao gồm mật khẩu)
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("email", savedUser.getEmail());
            response.put("firstName", savedUser.getFirstName());
            response.put("lastName", savedUser.getLastName());
            response.put("createdAt", savedUser.getCreatedAt());
            response.put("message", "Đăng ký thành công");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi đăng ký: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");

            // Tìm người dùng theo email (không bao gồm tài khoản đã bị xóa)
            Optional<User> userOpt = userService.findByEmail(email);

            // Kiểm tra xem email có tồn tại trong hệ thống không (bao gồm cả tài khoản đã bị xóa)
            // Nếu email tồn tại nhưng userOpt.isEmpty(), có nghĩa là tài khoản đã bị xóa
            boolean emailExists = userService.existsByEmailIncludeDeleted(email);

            if (userOpt.isEmpty()) {
                if (emailExists) {
                    // Email tồn tại nhưng tài khoản đã bị xóa
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("message", "Tài khoản không tồn tại hoặc đã bị xóa"));
                } else {
                    // Email không tồn tại
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
                }
            }

            User user = userOpt.get();

            // Kiểm tra mật khẩu
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
            }

            // Kiểm tra tài khoản có bị khóa không
            if (user.getIsBlocked() != null && user.getIsBlocked()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."));
            }

            // Trả về thông tin người dùng đã đăng nhập (không bao gồm mật khẩu)
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("avatar", user.getAvatar());
            response.put("bio", user.getBio());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi đăng nhập: " + e.getMessage()));
        }
    }
}