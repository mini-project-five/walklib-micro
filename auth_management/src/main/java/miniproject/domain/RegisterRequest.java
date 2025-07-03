package miniproject.domain;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String userName;
    private String role;
    
    // Author specific fields
    private String authorName;
    private String realName;
    private String introduction;
}