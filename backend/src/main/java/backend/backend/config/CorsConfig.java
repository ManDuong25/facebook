package backend.backend.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@SuppressWarnings("null") CorsRegistry registry) {
                registry.addMapping("/**") // Áp dụng cho tất cả các endpoint
                        .allowedOrigins("http://localhost:5173") // Origin của frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức HTTP cho phép
                        .allowedHeaders("*") // Cho phép tất cả header
                        .allowCredentials(true); // Nếu cần gửi cookie hoặc authentication
            }
        };
    }
}