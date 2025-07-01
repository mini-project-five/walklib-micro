package miniproject.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value = "/users")
@Transactional
public class UserController {

    @Autowired
    UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<User> signUp(@RequestBody User user) {
        // 이메일 중복 체크
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            // 이미 존재하는 이메일인 경우, 409 Conflict 응답 반환
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // 비밀번호는 암호화하지 않고 그대로 저장
        User savedUser = userRepository.save(user);

        // 회원가입 성공 시, 201 Created 응답과 함께 생성된 사용자 정보 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(
        @RequestBody User user,
        HttpServletResponse response
    ) {
        Optional<User> userOptional = userRepository.findByEmail(user.getEmail());

        if (userOptional.isPresent()) {
            User loginUser = userOptional.get();
            // 비밀번호 비교
            if (loginUser.getUserPassword().equals(user.getUserPassword())) {
                return ResponseEntity.ok(loginUser);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
//>>> Clean Arch / Inbound Adaptor
