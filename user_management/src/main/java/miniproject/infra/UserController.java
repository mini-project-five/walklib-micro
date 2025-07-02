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
    
    // KT 인증 요청
    @PostMapping("/{id}/kt-auth-request")
    public ResponseEntity<User> requestKtAuth(@PathVariable Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setKtAuthRequested(true);
            user.setKtAuthApproved(false); // 승인 대기 상태
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }
    
    // KT 인증 승인 (admin만 가능)
    @PostMapping("/{id}/kt-auth-approve")
    public ResponseEntity<User> approveKtAuth(@PathVariable Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (Boolean.TRUE.equals(user.getKtAuthRequested())) {
                user.setKtAuthApproved(true);
                user.setIsKtCustomer(true); // KT 고객으로 승인
                User updatedUser = userRepository.save(user);
                return ResponseEntity.ok(updatedUser);
            } else {
                return ResponseEntity.badRequest().build(); // 요청하지 않은 경우
            }
        }
        return ResponseEntity.notFound().build();
    }
    
    // KT 인증 거절 (admin만 가능)
    @PostMapping("/{id}/kt-auth-reject")
    public ResponseEntity<User> rejectKtAuth(@PathVariable Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setKtAuthRequested(false);
            user.setKtAuthApproved(false);
            user.setIsKtCustomer(false);
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }
    
    // KT 인증 대기 목록 조회 (admin용)
    @GetMapping("/kt-auth-pending")
    public ResponseEntity<Iterable<User>> getKtAuthPendingUsers() {
        Iterable<User> pendingUsers = userRepository.findByKtAuthRequestedTrueAndKtAuthApprovedFalse();
        return ResponseEntity.ok(pendingUsers);
    }
}
//>>> Clean Arch / Inbound Adaptor
