package backend.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối đến thư mục hiện tại
        String currentPath = new File("").getAbsolutePath();
        System.out.println("Application root directory: " + currentPath);

        // Đảm bảo thư mục uploads/avatars/ tồn tại
        File uploadDir = new File(currentPath + File.separator + "uploads");
        File avatarDir = new File(currentPath + File.separator + "uploads" + File.separator + "avatars");
        File coversDir = new File(currentPath + File.separator + "uploads" + File.separator + "covers");

        // Tạo thư mục nếu chưa tồn tại
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            System.out.println("Created uploads directory: " + created);
        }

        if (!avatarDir.exists()) {
            boolean created = avatarDir.mkdirs();
            System.out.println("Created avatars directory: " + created);
        }

        if (!coversDir.exists()) {
            boolean created = coversDir.mkdirs();
            System.out.println("Created covers directory: " + created);
        }

        // Sử dụng một cách nhất quán cho cả frontend và backend
        // Đường dẫn này sẽ map tất cả các URL /uploads/** tới thư mục uploads
        String fileUrl = "file:///" + currentPath.replace("\\", "/") + "/uploads/";
        registry.addResourceHandler("/uploads/**").addResourceLocations(fileUrl);
        System.out.println("Added resource handler: /uploads/** -> " + fileUrl);
    }

    // Thêm cấu hình CORS
    @Bean
    public CorsFilter corsFilter() {
        System.out.println("Configuring CORS filter");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Chỉ cho phép origin cụ thể
        config.addAllowedOrigin("http://localhost:5173");

        // Cho phép credentials
        config.setAllowCredentials(true);

        // Cho phép tất cả các header
        config.addAllowedHeader("*");

        // Cho phép tất cả các phương thức (GET, POST, PUT, DELETE, etc.)
        config.addAllowedMethod("*");

        // Cho phép các header cần thiết
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}