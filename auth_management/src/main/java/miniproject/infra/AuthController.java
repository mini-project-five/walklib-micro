package miniproject.infra;

import miniproject.domain.LoginRequest;
import miniproject.domain.RegisterRequest;
import miniproject.domain.AuthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    @Autowired
    private AuthorServiceClient authorServiceClient;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    // 사용자 회원가입
    @PostMapping("/users/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody RegisterRequest request) {
        logger.info("User registration request for email: {}", request.getEmail());
        
        try {
            Map<String, Object> response = userServiceClient.registerUser(request);
            
            if (response.get("user") != null) {
                Map<String, Object> user = (Map<String, Object>) response.get("user");
                Long userId = ((Number) user.get("userId")).longValue();
                String email = (String) user.get("email");
                String role = (String) user.get("role");
                
                String token = jwtTokenUtil.generateToken(userId, email, role);
                response.put("token", token);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("User registration failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // 사용자 로그인
    @PostMapping("/users/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody LoginRequest request) {
        logger.info("User login request for email: {}", request.getEmail());
        
        try {
            Map<String, Object> response = userServiceClient.loginUser(request);
            
            if (response.get("user") != null) {
                Map<String, Object> user = (Map<String, Object>) response.get("user");
                Long userId = ((Number) user.get("userId")).longValue();
                String email = (String) user.get("email");
                String role = (String) user.get("role");
                
                String token = jwtTokenUtil.generateToken(userId, email, role);
                response.put("token", token);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("User login failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
    
    // 작가 회원가입
    @PostMapping("/authors/register")
    public ResponseEntity<Map<String, Object>> registerAuthor(@RequestBody RegisterRequest request) {
        logger.info("Author registration request for email: {}", request.getEmail());
        
        try {
            Map<String, Object> response = authorServiceClient.registerAuthor(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Author registration failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // 작가 로그인
    @PostMapping("/authors/login")
    public ResponseEntity<Map<String, Object>> loginAuthor(@RequestBody LoginRequest request) {
        logger.info("Author login request for email: {}", request.getEmail());
        
        try {
            Map<String, Object> response = authorServiceClient.loginAuthor(request);
            
            if (response.get("author") != null) {
                Map<String, Object> author = (Map<String, Object>) response.get("author");
                Long authorId = ((Number) author.get("authorId")).longValue();
                String email = (String) author.get("email");
                String authorName = (String) author.get("authorName");
                String status = (String) author.get("authorRegisterStatus");
                
                String token = jwtTokenUtil.generateToken(authorId, email, authorName);
                response.put("token", token);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Author login failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
    
    // 토큰 검증
    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = jwtTokenUtil.extractTokenFromHeader(authHeader);
            
            if (token == null) {
                response.put("success", false);
                response.put("error", "토큰이 없습니다.");
                return ResponseEntity.status(401).body(response);
            }
            
            if (jwtTokenUtil.validateToken(token)) {
                response.put("success", true);
                response.put("tokenValid", true);
                response.put("email", jwtTokenUtil.getEmailFromToken(token));
                
                try {
                    response.put("userId", jwtTokenUtil.getUserIdFromToken(token));
                    response.put("role", jwtTokenUtil.getRoleFromToken(token));
                } catch (Exception e) {
                    // This might be an author token
                    logger.debug("Token might be for author: {}", e.getMessage());
                }
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "유효하지 않은 토큰입니다.");
                response.put("tokenValid", false);
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            logger.error("Token verification error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "토큰 검증 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}