package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.UserManagementApplication;

@Entity
@Table(name = "User_table")
@Data
//<<< DDD / Aggregate Root
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long userId;

    private String email;

    private String userPassword; // Changed from Long to String

    private String userName;

    private Boolean isKtCustomer;

    private String role; // READER, AUTHOR, ADMIN
    
    private String status; // ACTIVE, INACTIVE, SUSPENDED
    
    private Date registeredAt;
    
    private Date lastLoginAt;

    public static UserRepository repository() {
        UserRepository userRepository = UserManagementApplication.applicationContext.getBean(
            UserRepository.class
        );
        return userRepository;
    }
    
    //<<< Clean Arch / Port Method
    public static User registerUser(String email, String password, String userName, String role) {
        System.out.println("Registering new user: " + userName + " with role: " + role);
        
        // Check if user already exists
        if (repository().findByEmail(email).isPresent()) {
            System.out.println("User already exists with email: " + email);
            return null;
        }
        
        User user = new User();
        user.setEmail(email);
        user.setUserPassword(password); // In real app, this should be hashed
        user.setUserName(userName);
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setIsKtCustomer(false);
        user.setRegisteredAt(new Date());
        user.setLastLoginAt(new Date());
        
        repository().save(user);
        
        System.out.println("User registered successfully: " + user.getUserId());
        return user;
    }
    
    public static User authenticateUser(String email, String password) {
        System.out.println("Authenticating user: " + email);
        
        return repository().findByEmail(email)
            .filter(user -> "ACTIVE".equals(user.getStatus()))
            .filter(user -> password.equals(user.getUserPassword())) // In real app, compare hashed passwords
            .map(user -> {
                user.setLastLoginAt(new Date());
                repository().save(user);
                System.out.println("User authenticated successfully: " + user.getUserName());
                return user;
            })
            .orElse(null);
    }
    
    public static void updateUserStatus(Long userId, String status) {
        System.out.println("Updating user status: " + userId + " to " + status);
        
        repository().findById(userId).ifPresent(user -> {
            user.setStatus(status);
            repository().save(user);
            System.out.println("User status updated: " + user.getUserName() + " -> " + status);
        });
    }
    
    public static void promoteToAuthor(Long userId) {
        System.out.println("Promoting user to author: " + userId);
        
        repository().findById(userId).ifPresent(user -> {
            if ("READER".equals(user.getRole())) {
                user.setRole("AUTHOR");
                repository().save(user);
                System.out.println("User promoted to author: " + user.getUserName());
            } else {
                System.out.println("User is already an author or admin: " + user.getRole());
            }
        });
    }
    //>>> Clean Arch / Port Method
}
//>>> DDD / Aggregate Root
