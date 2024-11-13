package com.example.webchiasetailieu.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedHeaders("authorization", "content-type", "x-auth-token")
                        .allowedOrigins("http://localhost:63342") // Cụ thể nguồn frontend của bạn
                        .allowedMethods("GET", "POST", "PUT", "DELETE") // Các phương thức HTTP được phép
                        .allowCredentials(true);
            }
        };
    }
}
