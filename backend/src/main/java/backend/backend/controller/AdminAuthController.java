package backend.backend.controller;

import backend.backend.model.ResponseObject;
import backend.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private AdminService adminService;

    /**
     * API đăng nhập dành cho admin
     * 
     * @param loginData Map chứa username và password
     * @return ResponseEntity chứa thông tin đăng nhập nếu thành công
     */
    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(@RequestBody Map<String, String> loginData) {
        try {
            String username = loginData.get("username");
            String password = loginData.get("password");
            
            // Kiểm tra dữ liệu đầu vào
            if (username == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Tên đăng nhập và mật khẩu không được để trống", null));
            }
            
            // Xác thực admin
            Map<String, Object> adminData = adminService.authenticateAdmin(username, password);
            
            // Kiểm tra kết quả xác thực
            if (adminData == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseObject("error", "Tên đăng nhập hoặc mật khẩu không chính xác", null));
            }
            
            // Trả về thông tin admin đã đăng nhập
            return ResponseEntity.ok(new ResponseObject("success", "Đăng nhập thành công", adminData));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi đăng nhập: " + e.getMessage(), null));
        }
    }
    
    /**
     * API kiểm tra trạng thái đăng nhập của admin
     * 
     * @return ResponseEntity chứa thông tin trạng thái
     */
    @GetMapping("/check")
    public ResponseEntity<ResponseObject> checkAuthStatus() {
        // Trong thực tế, bạn sẽ kiểm tra JWT token ở đây
        // Hiện tại chỉ trả về thông báo để test
        return ResponseEntity.ok(new ResponseObject("success", "API kiểm tra trạng thái đăng nhập admin", null));
    }
}
