package miniproject.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String userName;
    private String email;
    private String role;
    
    public AuthResponse(String token, Long userId, String userName, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.role = role;
    }
}
