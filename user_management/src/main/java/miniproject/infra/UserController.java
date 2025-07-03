package miniproject.infra;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import javax.validation.Valid;
import miniproject.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;

//<<< Clean Arch / Inbound Adaptor

@RestController
@Order(Ordered.HIGHEST_PRECEDENCE)
@Transactional
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtTokenUtil jwtTokenUtil;

    /**
     * 모든 사용자 조회 (관리자 전용, 페이지네이션 지원)
     */
    @GetMapping("/users/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> usersPage = userRepository.findAll(pageable);
            
            response.put("success", true);
            response.put("users", usersPage.getContent());
            response.put("totalElements", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());
            response.put("currentPage", page);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving users: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "사용자 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 사용자 정보 조회 (본인 또는 관리자만)
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(
            @PathVariable("id") Long id,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // JWT 토큰에서 사용자 정보 추출
            String token = jwtTokenUtil.extractTokenFromHeader(request.getHeader("Authorization"));
            if (token == null || !jwtTokenUtil.validateToken(token)) {
                response.put("success", false);
                response.put("error", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Long requestUserId = jwtTokenUtil.getUserIdFromToken(token);
            String requestUserRole = jwtTokenUtil.getRoleFromToken(token);
            
            // 본인 또는 관리자만 조회 가능
            if (!requestUserId.equals(id) && !"ADMIN".equals(requestUserRole)) {
                response.put("success", false);
                response.put("error", "권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                response.put("success", true);
                response.put("user", userOpt.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving user: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "사용자 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 내부 회원가입 엔드포인트 (Auth 서비스에서만 호출)
     */
    @PostMapping("/users/internal/register")
    public ResponseEntity<Map<String, Object>> internalRegister(@RequestBody Map<String, String> request) {
        return registerUser(request);
    }
    
    /**
     * 내부 로그인 엔드포인트 (Auth 서비스에서만 호출)
     */
    @PostMapping("/users/internal/login")
    public ResponseEntity<Map<String, Object>> internalLogin(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            logger.info("Internal login attempt for email: {}", email);
            
            User user = User.authenticateUser(email, password);
            
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("user", user);
            
            logger.info("User authenticated successfully: {} (ID: {})", user.getUserName(), user.getUserId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.warn("Login failed for email {}: {}", request.get("email"), e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "로그인 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 사용자 회원가입 (이제는 내부에서만 사용)
     */
    private ResponseEntity<Map<String, Object>> registerUser(Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");
            String userName = request.get("userName");
            String role = request.getOrDefault("role", "READER");
            
            logger.info("User registration attempt for email: {}", email);
            
            User user = User.registerUser(email, password, userName, role);
            
            // JWT 토큰 생성
            String token = jwtTokenUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole());
            
            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다.");
            response.put("user", user);
            response.put("token", token);
            
            // 응답 헤더에도 토큰 추가
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            
            logger.info("User registered successfully: {} (ID: {})", user.getUserName(), user.getUserId());
            return ResponseEntity.ok().headers(headers).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("User registration failed - validation error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("User registration failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "회원가입 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * 토큰 검증 및 사용자 정보 조회
     */
    @PostMapping("/users/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = jwtTokenUtil.extractTokenFromHeader(request.getHeader("Authorization"));
            
            if (token == null) {
                response.put("success", false);
                response.put("error", "토큰이 없습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            if (jwtTokenUtil.validateToken(token)) {
                Long userId = jwtTokenUtil.getUserIdFromToken(token);
                String email = jwtTokenUtil.getEmailFromToken(token);
                String role = jwtTokenUtil.getRoleFromToken(token);
                
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    response.put("success", true);
                    response.put("user", userOpt.get());
                    response.put("tokenValid", true);
                    return ResponseEntity.ok(response);
                } else {
                    response.put("success", false);
                    response.put("error", "사용자를 찾을 수 없습니다.");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }
            } else {
                response.put("success", false);
                response.put("error", "유효하지 않은 토큰입니다.");
                response.put("tokenValid", false);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Token verification error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "토큰 검증 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 패스워드 변경
     */
    @PostMapping("/users/{id}/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // JWT 토큰 검증
            String token = jwtTokenUtil.extractTokenFromHeader(httpRequest.getHeader("Authorization"));
            if (token == null || !jwtTokenUtil.validateToken(token)) {
                response.put("success", false);
                response.put("error", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Long requestUserId = jwtTokenUtil.getUserIdFromToken(token);
            
            // 본인만 패스워드 변경 가능
            if (!requestUserId.equals(id)) {
                response.put("success", false);
                response.put("error", "본인의 패스워드만 변경할 수 있습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.changePassword(currentPassword, newPassword);
                userRepository.save(user);
                
                response.put("success", true);
                response.put("message", "패스워드가 성공적으로 변경되었습니다.");
                
                logger.info("Password changed successfully for user: {}", user.getEmail());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (IllegalArgumentException e) {
            logger.warn("Password change failed: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Password change error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "패스워드 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
        @PathVariable("id") Long id,
        @RequestBody Map<String, Object> updates,
        HttpServletRequest request
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

    @PostMapping("/users/{id}/promote-to-author")
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

    @PutMapping("/users/{id}/status")
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

    @DeleteMapping("/users/{id}")
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

    /**
     * 관리자 대시보드용 통계 정보
     */
    @GetMapping("/users/admin/dashboard-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // 전체 사용자 수
            long totalUsers = userRepository.count();
            stats.put("totalUsers", totalUsers);
            
            // 역할별 사용자 수
            long readerCount = userRepository.countByRole("READER");
            long authorCount = userRepository.countByRole("AUTHOR");
            long adminCount = userRepository.countByRole("ADMIN");
            
            stats.put("readerCount", readerCount);
            stats.put("authorCount", authorCount);
            stats.put("adminCount", adminCount);
            
            // 상태별 사용자 수
            long activeUsers = userRepository.countByStatus("ACTIVE");
            long inactiveUsers = userRepository.countByStatus("INACTIVE");
            long suspendedUsers = userRepository.countByStatus("SUSPENDED");
            
            stats.put("activeUsers", activeUsers);
            stats.put("inactiveUsers", inactiveUsers);
            stats.put("suspendedUsers", suspendedUsers);
            
            // 최근 가입자 (최근 7일)
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.add(java.util.Calendar.DAY_OF_MONTH, -7);
            java.util.Date weekAgo = cal.getTime();
            
            long recentSignups = userRepository.countByRegisteredAtAfter(weekAgo);
            stats.put("recentSignups", recentSignups);
            
            response.put("success", true);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving dashboard stats: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "대시보드 통계 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 관리자 로그인 (별도 엔드포인트)
     */
    @PostMapping("/users/admin/login")
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            logger.info("Admin login attempt for email: {}", email);
            
            User user = User.authenticateUser(email, password);
            
            // 관리자 권한 확인
            if (!"ADMIN".equals(user.getRole())) {
                response.put("success", false);
                response.put("error", "관리자 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            // JWT 토큰 생성
            String token = jwtTokenUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole());
            
            response.put("success", true);
            response.put("message", "관리자 로그인 성공");
            response.put("user", user);
            response.put("token", token);
            response.put("role", "ADMIN");
            
            // 응답 헤더에도 토큰 추가
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            
            logger.info("Admin logged in successfully: {} (ID: {})", user.getUserName(), user.getUserId());
            return ResponseEntity.ok().headers(headers).body(response);
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.warn("Admin login failed for email {}: {}", request.get("email"), e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            logger.error("Admin login error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "관리자 로그인 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 사용자 검색 (관리자 전용)
     */
    @GetMapping("/users/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> searchUsers(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> usersPage;
            
            // 검색 조건에 따라 다른 쿼리 실행
            if (email != null && !email.trim().isEmpty()) {
                usersPage = userRepository.findByEmailContainingIgnoreCase(email.trim(), pageable);
            } else if (userName != null && !userName.trim().isEmpty()) {
                usersPage = userRepository.findByUserNameContainingIgnoreCase(userName.trim(), pageable);
            } else if (role != null && !role.trim().isEmpty()) {
                usersPage = userRepository.findByRole(role.trim(), pageable);
            } else if (status != null && !status.trim().isEmpty()) {
                usersPage = userRepository.findByStatus(status.trim(), pageable);
            } else {
                usersPage = userRepository.findAll(pageable);
            }
            
            response.put("success", true);
            response.put("users", usersPage.getContent());
            response.put("totalElements", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());
            response.put("currentPage", page);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error searching users: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "사용자 검색 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
