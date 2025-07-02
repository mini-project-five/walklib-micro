package miniproject.infra;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/auth")
@Transactional
@CrossOrigin(origins = "*")
public class AuthorController {

    @Autowired
    AuthorRepository authorRepository;

    @PostMapping("/author/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            if (email == null || password == null) {
                response.put("success", false);
                response.put("error", "Email and password are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Author author = Author.authenticateAuthor(email, password);
            
            if (author != null) {
                response.put("success", true);
                response.put("author", author);
                
                // 명시적으로 authorId도 추가
                response.put("authorId", author.getAuthorId());
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Invalid email or password, or author not approved");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
