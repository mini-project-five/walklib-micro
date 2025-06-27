package miniproject.controller;

import miniproject.config.JwtUtils;
import miniproject.domain.User;
import miniproject.domain.UserRepository;
import miniproject.dto.AuthResponse;
import miniproject.dto.LoginRequest;
import miniproject.dto.SignupRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest, HttpServletRequest request) {
        logger.info("=== 회원가입 API 호출 ===");
        logger.info("요청 메소드: {}", request.getMethod());
        logger.info("요청 URI: {}", request.getRequestURI());
        logger.info("클라이언트 IP: {}", request.getRemoteAddr());
        logger.info("User-Agent: {}", request.getHeader("User-Agent"));
        logger.info("Content-Type: {}", request.getHeader("Content-Type"));
        logger.info("회원가입 요청 시작 - 이메일: {}, 사용자명: {}, 실명: {}, 필명: {}, 역할: {}", 
                   signupRequest.getEmail(), signupRequest.getUserName(), signupRequest.getRealName(), 
                   signupRequest.getPenName(), signupRequest.getRole());
        
        try {
            // 요청 데이터 검증
            if (signupRequest.getEmail() == null || signupRequest.getEmail().trim().isEmpty()) {
                logger.warn("회원가입 실패: 이메일이 비어있음");
                return ResponseEntity.badRequest().body("Error: 이메일은 필수입니다!");
            }
            
            if (signupRequest.getPassword() == null || signupRequest.getPassword().trim().isEmpty()) {
                logger.warn("회원가입 실패: 비밀번호가 비어있음 - 이메일: {}", signupRequest.getEmail());
                return ResponseEntity.badRequest().body("Error: 비밀번호는 필수입니다!");
            }
            
            // 사용자명 처리: 작가의 경우 자동 생성, 일반 사용자는 필수
            String userName = signupRequest.getUserName();
            if ("AUTHOR".equals(signupRequest.getRole())) {
                // 작가의 경우 userName이 없으면 자동 생성
                if (userName == null || userName.trim().isEmpty()) {
                    if (signupRequest.getPenName() != null && !signupRequest.getPenName().trim().isEmpty()) {
                        userName = signupRequest.getPenName().replaceAll("\\s+", "");
                        logger.debug("작가 사용자명 자동 생성 (필명 기반): {}", userName);
                    } else if (signupRequest.getRealName() != null && !signupRequest.getRealName().trim().isEmpty()) {
                        userName = signupRequest.getRealName().replaceAll("\\s+", "");
                        logger.debug("작가 사용자명 자동 생성 (실명 기반): {}", userName);
                    } else {
                        logger.warn("회원가입 실패: 작가는 실명 또는 필명이 필요합니다 - 이메일: {}", signupRequest.getEmail());
                        return ResponseEntity.badRequest().body("Error: 작가는 실명 또는 필명이 필요합니다!");
                    }
                }
            } else {
                // 일반 사용자의 경우 userName 필수
                if (userName == null || userName.trim().isEmpty()) {
                    logger.warn("회원가입 실패: 사용자명이 비어있음 - 이메일: {}", signupRequest.getEmail());
                    return ResponseEntity.badRequest().body("Error: 사용자명은 필수입니다!");
                }
            }

            // 이메일 중복 체크
            logger.debug("이메일 중복 체크 중: {}", signupRequest.getEmail());
            if (userRepository.existsByEmail(signupRequest.getEmail())) {
                logger.warn("회원가입 실패: 이메일 중복 - {}", signupRequest.getEmail());
                return ResponseEntity.badRequest()
                    .body("Error: 이미 사용 중인 이메일입니다!");
            }

            // 비밀번호 확인 검증
            if (signupRequest.getConfirmPassword() != null && 
                !signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
                logger.warn("회원가입 실패: 비밀번호 불일치 - 이메일: {}", signupRequest.getEmail());
                return ResponseEntity.badRequest()
                    .body("Error: 비밀번호가 일치하지 않습니다!");
            }

            // 새 사용자 생성
            logger.debug("새 사용자 객체 생성 중 - 이메일: {}, 사용자명: {}", signupRequest.getEmail(), userName);
            User user = new User();
            user.setUserName(userName);
            user.setEmail(signupRequest.getEmail());
            user.setUserPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.setRealName(signupRequest.getRealName());
            user.setPenName(signupRequest.getPenName());
            user.setIsKtCustomer(signupRequest.getIsKtCustomer());
            user.setRole(signupRequest.getRole());

            logger.debug("사용자 데이터베이스 저장 중 - 이메일: {}", signupRequest.getEmail());
            user = userRepository.save(user);
            logger.info("사용자 성공적으로 저장됨 - 사용자 ID: {}, 이메일: {}", user.getUserId(), user.getEmail());

            // JWT 토큰 생성
            logger.debug("JWT 토큰 생성 중 - 사용자 ID: {}", user.getUserId());
            String jwt = jwtUtils.generateToken(
                user.getEmail(), 
                user.getRole(), 
                user.getUserId()
            );

            logger.info("회원가입 성공 - 사용자 ID: {}, 이메일: {}, 역할: {}", 
                       user.getUserId(), user.getEmail(), user.getRole());

            return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getRole()
            ));
        } catch (Exception e) {
            logger.error("회원가입 중 예외 발생 - 이메일: {}, 오류: {}", 
                        signupRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body("Error: 회원가입 중 오류가 발생했습니다. " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        logger.info("=== 로그인 API 호출 ===");
        logger.info("요청 메소드: {}", request.getMethod());
        logger.info("요청 URI: {}", request.getRequestURI());
        logger.info("클라이언트 IP: {}", request.getRemoteAddr());
        logger.info("User-Agent: {}", request.getHeader("User-Agent"));
        logger.info("Content-Type: {}", request.getHeader("Content-Type"));
        logger.info("로그인 요청 시작 - 이메일: {}", loginRequest.getEmail());
        
        try {
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                logger.warn("로그인 실패: 이메일이 비어있음");
                return ResponseEntity.badRequest().body("Error: 이메일은 필수입니다!");
            }
            
            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                logger.warn("로그인 실패: 비밀번호가 비어있음 - 이메일: {}", loginRequest.getEmail());
                return ResponseEntity.badRequest().body("Error: 비밀번호는 필수입니다!");
            }

            logger.debug("사용자 조회 중 - 이메일: {}", loginRequest.getEmail());
            Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
            
            if (!userOptional.isPresent()) {
                logger.warn("로그인 실패: 사용자 없음 - 이메일: {}", loginRequest.getEmail());
                return ResponseEntity.badRequest()
                    .body("Error: 사용자를 찾을 수 없습니다!");
            }

            User user = userOptional.get();
            logger.debug("사용자 찾음 - 사용자 ID: {}, 이메일: {}", user.getUserId(), user.getEmail());

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getUserPassword())) {
                logger.warn("로그인 실패: 비밀번호 불일치 - 이메일: {}", loginRequest.getEmail());
                return ResponseEntity.badRequest()
                    .body("Error: 잘못된 비밀번호입니다!");
            }

            // JWT 토큰 생성
            logger.debug("JWT 토큰 생성 중 - 사용자 ID: {}", user.getUserId());
            String jwt = jwtUtils.generateToken(
                user.getEmail(), 
                user.getRole(), 
                user.getUserId()
            );

            logger.info("로그인 성공 - 사용자 ID: {}, 이메일: {}, 역할: {}", 
                       user.getUserId(), user.getEmail(), user.getRole());

            return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getRole()
            ));
        } catch (Exception e) {
            logger.error("로그인 중 예외 발생 - 이메일: {}, 오류: {}", 
                        loginRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body("Error: 로그인 중 오류가 발생했습니다. " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader("Authorization") String token,
            HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.badRequest().body("Error: 인증되지 않은 사용자입니다!");
            }

            Optional<User> userOptional = userRepository.findById(userId);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("Error: 사용자를 찾을 수 없습니다!");
            }

            User user = userOptional.get();
            return ResponseEntity.ok(new AuthResponse(
                null, // 토큰은 응답에 포함하지 않음
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error: 사용자 정보 조회 중 오류가 발생했습니다. " + e.getMessage());
        }
    }
}
