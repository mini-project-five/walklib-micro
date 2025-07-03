package miniproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
import miniproject.AuthorManagementApplication;
import miniproject.domain.AuthorRegisterApplied;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity
@Table(name = "Author_table", indexes = {
    @Index(name = "idx_author_email", columnList = "email", unique = true),
    @Index(name = "idx_author_status", columnList = "authorRegisterStatus")
})
@Data
//<<< DDD / Aggregate Root
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonProperty("authorId")
    private Long authorId;

    @Column(nullable = false)
    @NotBlank(message = "작가명은 필수입니다")
    @Size(min = 2, max = 50, message = "작가명은 2-50자 사이여야 합니다")
    private String authorName;

    @Column(unique = true, nullable = false)
    @Email(message = "유효한 이메일 주소를 입력해주세요")
    @NotBlank(message = "이메일은 필수입니다")
    private String email;

    @Column(columnDefinition = "TEXT")
    @Size(max = 5000, message = "소개글은 5000자 이하여야 합니다")
    private String introduction;

    @Column(nullable = false)
    @JsonIgnore // 응답에서 패스워드 제외
    private String authorPassword; // 해시된 패스워드 저장

    @Column(nullable = false)
    @NotBlank(message = "실명은 필수입니다")
    @Size(min = 2, max = 30, message = "실명은 2-30자 사이여야 합니다")
    private String realName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthorRegisterStatus authorRegisterStatus = AuthorRegisterStatus.PENDING; // PENDING, APPROVED, REJECTED

    @Embedded
    private ManuscriptId manuscriptId;

    // 보안 관련 필드 추가
    private Integer loginAttempts = 0;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lockedUntil;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date registeredAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastLoginAt;

    @PrePersist
    public void onPrePersist() {
        // Set initial status if not already set
        if (this.authorRegisterStatus == null) {
            this.authorRegisterStatus = AuthorRegisterStatus.PENDING;
        }
        if (this.registeredAt == null) {
            this.registeredAt = new Date();
        }
        if (this.loginAttempts == null) {
            this.loginAttempts = 0;
        }
    }

    @PostPersist
    public void onPostPersist() {
        AuthorRegisterApplied authorRegisterApplied = new AuthorRegisterApplied(
            this
        );
        authorRegisterApplied.publishAfterCommit();
    }

    public static AuthorRepository repository() {
        AuthorRepository authorRepository = AuthorManagementApplication.applicationContext.getBean(
            AuthorRepository.class
        );
        return authorRepository;
    }

    private static PasswordEncoder passwordEncoder() {
        return AuthorManagementApplication.applicationContext.getBean(PasswordEncoder.class);
    }

    //<<< Clean Arch / Port Method
    public static Author registerAuthor(String authorName, String email, String password, String realName, String introduction) {
        // 입력값 검증
        validateEmail(email);
        validatePassword(password);
        validateAuthorName(authorName);
        validateRealName(realName);
        
        System.out.println("Registering new author: " + authorName + " with email: " + email);
        
        // 중복 이메일 체크
        if (repository().findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("이미 등록된 이메일입니다: " + email);
        }
        
        Author author = new Author();
        author.setAuthorName(authorName.trim());
        author.setEmail(email.toLowerCase().trim());
        author.setAuthorPassword(passwordEncoder().encode(password)); // 패스워드 해싱
        author.setRealName(realName.trim());
        author.setIntroduction(introduction != null ? introduction.trim() : null);
        author.setAuthorRegisterStatus(AuthorRegisterStatus.PENDING);
        author.setRegisteredAt(new Date());
        author.setLoginAttempts(0);
        
        Author savedAuthor = repository().save(author);
        
        System.out.println("Author registered successfully: " + savedAuthor.getAuthorId());
        return savedAuthor;
    }

    public static Author authenticateAuthor(String email, String password) {
        validateEmail(email);
        validatePassword(password);
        
        System.out.println("Authenticating author: " + email);
        
        return repository().findByEmail(email.toLowerCase().trim())
            .map(author -> {
                // 계정 잠금 상태 확인
                if (author.isAccountLocked()) {
                    throw new IllegalStateException("계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.");
                }
                
                // 승인 상태 확인
                if (!AuthorRegisterStatus.APPROVED.equals(author.getAuthorRegisterStatus())) {
                    String message;
                    switch (author.getAuthorRegisterStatus()) {
                        case PENDING:
                            message = "계정 승인 대기 중입니다. 관리자의 승인을 기다려주세요.";
                            break;
                        case REJECTED:
                            message = "계정이 거부되었습니다. 관리자에게 문의하세요.";
                            break;
                        default:
                            message = "계정 상태를 확인할 수 없습니다.";
                            break;
                    }
                    throw new IllegalStateException(message);
                }
                
                // 패스워드 검증
                if (passwordEncoder().matches(password, author.getAuthorPassword())) {
                    // 로그인 성공 - 시도 횟수 초기화
                    author.resetLoginAttempts();
                    author.setLastLoginAt(new Date());
                    repository().save(author);
                    
                    System.out.println("Author authenticated successfully: " + author.getAuthorName());
                    return author;
                } else {
                    // 로그인 실패 - 시도 횟수 증가
                    author.incrementLoginAttempts();
                    repository().save(author);
                    
                    System.out.println("Authentication failed for author: " + email);
                    throw new IllegalArgumentException("이메일 또는 패스워드가 올바르지 않습니다.");
                }
            })
            .orElseThrow(() -> new IllegalArgumentException("이메일 또는 패스워드가 올바르지 않습니다."));
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

    public boolean isApproved() {
        return AuthorRegisterStatus.APPROVED.equals(this.authorRegisterStatus);
    }

    public void changePassword(String currentPassword, String newPassword) {
        if (!passwordEncoder().matches(currentPassword, this.authorPassword)) {
            throw new IllegalArgumentException("현재 패스워드가 올바르지 않습니다.");
        }
        
        validatePassword(newPassword);
        this.authorPassword = passwordEncoder().encode(newPassword);
    }

    public void approve() {
        if (this.authorRegisterStatus == AuthorRegisterStatus.PENDING) {
            this.authorRegisterStatus = AuthorRegisterStatus.APPROVED;
        } else {
            throw new IllegalStateException("대기 상태인 계정만 승인할 수 있습니다.");
        }
    }

    public void reject() {
        if (this.authorRegisterStatus == AuthorRegisterStatus.PENDING) {
            this.authorRegisterStatus = AuthorRegisterStatus.REJECTED;
        } else {
            throw new IllegalStateException("대기 상태인 계정만 거부할 수 있습니다.");
        }
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

    private static void validateAuthorName(String authorName) {
        if (authorName == null || authorName.trim().length() < 2) {
            throw new IllegalArgumentException("작가명은 최소 2자 이상이어야 합니다.");
        }
        
        if (authorName.trim().length() > 50) {
            throw new IllegalArgumentException("작가명은 50자 이하여야 합니다.");
        }
    }

    private static void validateRealName(String realName) {
        if (realName == null || realName.trim().length() < 2) {
            throw new IllegalArgumentException("실명은 최소 2자 이상이어야 합니다.");
        }
        
        if (realName.trim().length() > 30) {
            throw new IllegalArgumentException("실명은 30자 이하여야 합니다.");
        }
    }
    //>>> Clean Arch / Port Method

    public static void authorRegisterPolicy(
        AuthorRegisterApplied authorRegisterApplied
    ){
        // This method can be used for additional processing after author registration
        System.out.println("Author register policy triggered for: " + authorRegisterApplied.getAuthorName());
    }

    //<<< Clean Arch / Port Method
    public static void authorStatusManagementPolicy(
        AuthorApproved authorApproved
    ) {
        System.out.println("Author approval policy triggered for author: " + authorApproved.getAuthorId());
        
        // Update author status to APPROVED
        Author author = repository().findById(authorApproved.getAuthorId()).orElse(null);
        if (author != null) {
            author.setAuthorRegisterStatus(AuthorRegisterStatus.APPROVED);
            repository().save(author);
            System.out.println("Author status updated to APPROVED: " + author.getAuthorName());
        }
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method  
    public static void authorRejectionManagementPolicy(
        AuthorRejected authorRejected
    ) {
        System.out.println("Author rejection policy triggered for author: " + authorRejected.getAuthorId());
        
        // Update author status to REJECTED
        Author author = repository().findById(authorRejected.getAuthorId()).orElse(null);
        if (author != null) {
            author.setAuthorRegisterStatus(AuthorRegisterStatus.REJECTED);
            repository().save(author);
            System.out.println("Author status updated to REJECTED: " + author.getAuthorName());
        }
    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
