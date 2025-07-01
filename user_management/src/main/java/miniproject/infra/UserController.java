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
@RequestMapping(value="/users")
@Transactional
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public Iterable<User> getAll() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<User> getById(@PathVariable("id") Long id) {
        return userRepository.findById(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");
            String userName = request.get("userName");
            String role = request.getOrDefault("role", "READER");
            
            if (email == null || password == null || userName == null) {
                response.put("success", false);
                response.put("error", "Email, password, and userName are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if user already exists
            if (userRepository.findByEmail(email).isPresent()) {
                response.put("success", false);
                response.put("error", "User already exists with this email");
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = User.registerUser(email, password, userName, role);
            
            if (user != null) {
                response.put("success", true);
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to create user");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
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
            
            User user = User.authenticateUser(email, password);
            
            if (user != null) {
                response.put("success", true);
                response.put("user", user);
                System.out.println("User logged in successfully: " + user.getUserName());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error during login: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
        @PathVariable("id") Long id,
        @RequestBody Map<String, Object> updates
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<User> optionalUser = userRepository.findById(id);
            
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                
                // Update fields if provided
                if (updates.containsKey("userName")) {
                    user.setUserName((String) updates.get("userName"));
                }
                if (updates.containsKey("email")) {
                    user.setEmail((String) updates.get("email"));
                }
                if (updates.containsKey("role")) {
                    user.setRole((String) updates.get("role"));
                }
                if (updates.containsKey("status")) {
                    user.setStatus((String) updates.get("status"));
                }
                
                userRepository.save(user);
                
                response.put("success", true);
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/{id}/promote-to-author")
    public ResponseEntity<Map<String, Object>> promoteToAuthor(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User.promoteToAuthor(id);
            
            Optional<User> updatedUser = userRepository.findById(id);
            if (updatedUser.isPresent()) {
                response.put("success", true);
                response.put("user", updatedUser.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "User not found after promotion");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error promoting user to author: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
        @PathVariable("id") Long id,
        @RequestBody Map<String, String> request
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String status = request.get("status");
            
            if (status == null) {
                response.put("success", false);
                response.put("error", "Status is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            User.updateUserStatus(id, status);
            
            Optional<User> updatedUser = userRepository.findById(id);
            if (updatedUser.isPresent()) {
                response.put("success", true);
                response.put("user", updatedUser.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "User not found after status update");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error updating user status: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                response.put("success", true);
                response.put("message", "User deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error deleting user: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
