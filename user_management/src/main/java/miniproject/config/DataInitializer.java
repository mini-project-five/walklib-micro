package miniproject.config;

import miniproject.domain.User;
import miniproject.domain.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // 기본 admin 계정 생성 (기존 계정 삭제 후 재생성)
        try {
            // 기존 admin 계정 삭제
            userRepository.findByEmail("admin@walklib.com").ifPresent(user -> {
                userRepository.delete(user);
                logger.info("Deleted existing admin account");
            });
            
            // 새 admin 계정 생성
            User adminUser = User.registerUser("admin@walklib.com", "admin123", "Administrator", "ADMIN");
            logger.info("Default admin account created: admin@walklib.com with password: admin123");
        } catch (Exception e) {
            logger.error("Failed to create default admin account: {}", e.getMessage(), e);
        }
    }
}