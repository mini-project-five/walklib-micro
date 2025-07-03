package miniproject.domain;

import lombok.Data;
import java.util.Map;

@Data
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private Map<String, Object> user;
    private Map<String, Object> author;
    private String error;
}