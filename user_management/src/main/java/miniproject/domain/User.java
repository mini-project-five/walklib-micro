package miniproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import lombok.Data;
import miniproject.UserManagementApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity
@Table(name = "User_table", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_role", columnList = "role"),
    @Index(name = "idx_user_status", columnList = "status")
})
@Data
//<<< DDD / Aggregate Root
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long userId;

    @Column(unique = true, nullable = false)
    @Email(message = "유효한 이메일 주소를 입력해주세요")
    @NotBlank(message = "이메일은 필수입니다")
    private String email;

    @Column(nullable = false)
    @JsonIgnore // 응답에서 패스워드 제외
    private String userPassword; // 해시된 패스워드 저장

    @Column(nullable = false)
    @NotBlank(message = "사용자명은 필수입니다")
    @Size(min = 2, max = 50, message = "사용자명은 2-50자 사이여야 합니다")
    private String userName;

    @Column(nullable = false)
    private Boolean isKtCustomer = false;

    @Column(nullable = false)
    private String role = "READER"; // READER, AUTHOR, ADMIN
    
    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED
    
    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date registeredAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastLoginAt;

    // 계정 잠금 관련 필드 추가
    private Integer loginAttempts = 0;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lockedUntil;

    public static UserRepository repository() {
        UserRepository userRepository = UserManagementApplication.applicationContext.getBean(
            UserRepository.class
        );
        return userRepository;
    }

    private static PasswordEncoder passwordEncoder() {
        return UserManagementApplication.applicationContext.getBean(PasswordEncoder.class);
    }
    
    //<<< Clean Arch / Port Method
    public static User registerUser(String email, String password, String userName, String role) {
        // 입력값 검증
        validateEmail(email);
        validatePassword(password);
        validateUserName(userName);
        validateRole(role);
        
        System.out.println("Registering new user: " + userName + " with role: " + role);
        
        // 중복 이메일 체크
        if (repository().findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("이미 등록된 이메일입니다: " + email);
        }
        
        User user = new User();
        user.setEmail(email.toLowerCase().trim()); // 이메일 정규화
        user.setUserPassword(passwordEncoder().encode(password)); // 패스워드 해싱
        user.setUserName(userName.trim());
        user.setRole(role.toUpperCase());
        user.setStatus("ACTIVE");
        user.setIsKtCustomer(false);
        user.setRegisteredAt(new Date());
        user.setLastLoginAt(new Date());
        user.setLoginAttempts(0);
        
        User savedUser = repository().save(user);
        
        System.out.println("User registered successfully: " + savedUser.getUserId());
        return savedUser;
    }
    
    public static User authenticateUser(String email, String password) {
        validateEmail(email);
        validatePassword(password);
        
        System.out.println("Authenticating user: " + email);
        
        return repository().findByEmail(email.toLowerCase().trim())
            .map(user -> {
                // 계정 잠금 상태 확인
                if (user.isAccountLocked()) {
                    throw new IllegalStateException("계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.");
                }
                
                // 계정 상태 확인
                if (!"ACTIVE".equals(user.getStatus())) {
                    throw new IllegalStateException("비활성화된 계정입니다. 관리자에게 문의하세요.");
                }
                
                // 패스워드 검증
                if (passwordEncoder().matches(password, user.getUserPassword())) {
                    // 로그인 성공 - 시도 횟수 초기화
                    user.resetLoginAttempts();
                    user.setLastLoginAt(new Date());
                    repository().save(user);
                    
                    System.out.println("User authenticated successfully: " + user.getUserName());
                    return user;
                } else {
                    // 로그인 실패 - 시도 횟수 증가
                    user.incrementLoginAttempts();
                    repository().save(user);
                    
                    System.out.println("Authentication failed for user: " + email);
                    throw new IllegalArgumentException("이메일 또는 패스워드가 올바르지 않습니다.");
                }
            })
            .orElseThrow(() -> new IllegalArgumentException("이메일 또는 패스워드가 올바르지 않습니다."));
    }
    
    public static void updateUserStatus(Long userId, String status) {
        validateUserId(userId);
        validateStatus(status);
        
        System.out.println("Updating user status: " + userId + " to " + status);
        
        repository().findById(userId).ifPresentOrElse(user -> {
            user.setStatus(status.toUpperCase());
            repository().save(user);
            System.out.println("User status updated: " + user.getUserName() + " -> " + status);
        }, () -> {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId);
        });
    }
    
    public static void promoteToAuthor(Long userId) {
        validateUserId(userId);
        
        System.out.println("Promoting user to author: " + userId);
        
        repository().findById(userId).ifPresentOrElse(user -> {
            if ("READER".equals(user.getRole())) {
                user.setRole("AUTHOR");
                repository().save(user);
                System.out.println("User promoted to author: " + user.getUserName());
            } else {
                throw new IllegalStateException("사용자는 이미 작가이거나 관리자입니다: " + user.getRole());
            }
        }, () -> {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId);
        });
    }

    // 비즈니스 로직 메서드들
    public boolean isAccountLocked() {
        return lockedUntil != null && lockedUntil.after(new Date());
    }

    public void incrementLoginAttempts() {
        this.loginAttempts++;
        
        // 5회 실패 시 30분 잠금
        if (this.loginAttempts >= 5) {
            this.lockedUntil = new Date(System.currentTimeMillis() + 30 * 60 * 1000); // 30분
            System.out.println("Account locked due to too many failed login attempts: " + this.email);
        }
    }

    public void resetLoginAttempts() {
        this.loginAttempts = 0;
        this.lockedUntil = null;
    }

    public boolean canPromoteToAuthor() {
        return "READER".equals(this.role) && "ACTIVE".equals(this.status);
    }

    public void changePassword(String currentPassword, String newPassword) {
        if (!passwordEncoder().matches(currentPassword, this.userPassword)) {
            throw new IllegalArgumentException("현재 패스워드가 올바르지 않습니다.");
        }
        
        validatePassword(newPassword);
        this.userPassword = passwordEncoder().encode(newPassword);
    }

    // 검증 메서드들
    private static void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일은 필수입니다.");
        }
        
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("유효한 이메일 형식이 아닙니다.");
        }
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("패스워드는 최소 8자 이상이어야 합니다.");
        }
        
        if (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&].*$")) {
            throw new IllegalArgumentException("패스워드는 대소문자, 숫자, 특수문자를 포함해야 합니다.");
        }
    }

    private static void validateUserName(String userName) {
        if (userName == null || userName.trim().length() < 2) {
            throw new IllegalArgumentException("사용자명은 최소 2자 이상이어야 합니다.");
        }
        
        if (userName.trim().length() > 50) {
            throw new IllegalArgumentException("사용자명은 50자 이하여야 합니다.");
        }
    }

    private static void validateRole(String role) {
        if (role == null || (!role.toUpperCase().matches("READER|AUTHOR|ADMIN"))) {
            throw new IllegalArgumentException("유효하지 않은 역할입니다. READER, AUTHOR, ADMIN 중 하나여야 합니다.");
        }
    }

    private static void validateStatus(String status) {
        if (status == null || (!status.toUpperCase().matches("ACTIVE|INACTIVE|SUSPENDED"))) {
            throw new IllegalArgumentException("유효하지 않은 상태입니다. ACTIVE, INACTIVE, SUSPENDED 중 하나여야 합니다.");
        }
    }

    private static void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("유효하지 않은 사용자 ID입니다.");
        }
    }

    @PostPersist
    public void onPostPersist() {
        UserCreated userCreated = new UserCreated(this);
        userCreated.publishAfterCommit();
    }
    
    //>>> Clean Arch / Port Method
}
//>>> DDD / Aggregate Root
