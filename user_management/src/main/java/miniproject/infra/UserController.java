package miniproject.infra;

import java.util.Optional;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/users")
@Transactional
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @PostMapping("")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // 기본값 설정
        if (user.getCoins() == null) {
            user.setCoins(100);
        }
        if (user.getIsSubscribed() == null) {
            user.setIsSubscribed(false);
        }
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("")
    public ResponseEntity<Iterable<User>> getAllUsers() {
        Iterable<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setUserName(userDetails.getUserName());
            user.setEmail(userDetails.getEmail());
            if (userDetails.getUserPassword() != null) {
                user.setUserPassword(userDetails.getUserPassword());
            }
            if (userDetails.getCoins() != null) {
                user.setCoins(userDetails.getCoins());
            }
            if (userDetails.getIsSubscribed() != null) {
                user.setIsSubscribed(userDetails.getIsSubscribed());
            }
            if (userDetails.getUserType() != null) {
                user.setUserType(userDetails.getUserType());
            }
            
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
//>>> Clean Arch / Inbound Adaptor
