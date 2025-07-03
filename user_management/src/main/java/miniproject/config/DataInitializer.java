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
        // 기본 admin 계정이 없으면 생성
        try {
            if (!userRepository.findByEmail("admin@walklib.com").isPresent()) {
                User adminUser = new User();
                adminUser.setEmail("admin@walklib.com");
                adminUser.setUserName("Administrator");
                adminUser.setRole("ADMIN");
                adminUser.setStatus("ACTIVE");
                adminUser.setIsKtCustomer(false);
                adminUser.setRegisteredAt(new java.util.Date());
                adminUser.setLastLoginAt(new java.util.Date());
                adminUser.setLoginAttempts(0);
                adminUser.setAccountLocked(false);
                
                // 비밀번호 해싱
                String hashedPassword = org.springframework.security.crypto.bcrypt.BCrypt.hashpw("AdminPass123@", org.springframework.security.crypto.bcrypt.BCrypt.gensalt(12));
                adminUser.setUserPassword(hashedPassword);
                
                userRepository.save(adminUser);
                logger.info("Default admin account created: admin@walklib.com");
            } else {
                logger.info("Default admin account already exists");
            }
        } catch (Exception e) {
            logger.error("Failed to create default admin account: {}", e.getMessage(), e);
        }
    }
}