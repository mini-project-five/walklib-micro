package miniproject.infra;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
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

//<<< Clean Arch / Inbound Adaptor

@RestController
@Transactional
public class AuthorController {

    private static final Logger logger = LoggerFactory.getLogger(AuthorController.class);

    @Autowired
    AuthorRepository authorRepository;

    @Autowired
    JwtTokenUtil jwtTokenUtil;

    /**
     * 작가 회원가입 (공개 엔드포인트)
     */
    @PostMapping("/auth/author/register")
    public ResponseEntity<Map<String, Object>> registerAuthor(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String authorName = request.get("authorName");
            String email = request.get("email");
            String password = request.get("password");
            String realName = request.get("realName");
            String introduction = request.get("introduction");
            
            logger.info("Author registration attempt for email: {}", email);
            
            Author author = Author.registerAuthor(authorName, email, password, realName, introduction);
            
            // 등록 성공 시 토큰은 생성하지 않음 (승인 후에 로그인 가능)
            response.put("success", true);
            response.put("message", "작가 등록이 완료되었습니다. 관리자의 승인을 기다려주세요.");
            response.put("author", author);
            response.put("status", "PENDING");
            
            logger.info("Author registered successfully: {} (ID: {})", author.getAuthorName(), author.getAuthorId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Author registration failed - validation error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Author registration failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 등록 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 작가 로그인 (공개 엔드포인트)
     */
    @PostMapping("/auth/author/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            logger.info("Author login attempt for email: {}", email);
            
            Author author = Author.authenticateAuthor(email, password);
            
            // JWT 토큰 생성
            String token = jwtTokenUtil.generateToken(
                author.getAuthorId(), 
                author.getEmail(), 
                author.getAuthorName(),
                author.getAuthorRegisterStatus().toString()
            );
            
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("author", author);
            response.put("authorId", author.getAuthorId()); // 호환성을 위해 명시적 추가
            response.put("token", token);
            
            // 응답 헤더에도 토큰 추가
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            
            logger.info("Author logged in successfully: {} (ID: {})", author.getAuthorName(), author.getAuthorId());
            return ResponseEntity.ok().headers(headers).body(response);
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.warn("Author login failed for email {}: {}", request.get("email"), e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            logger.error("Author login error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "로그인 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 토큰 검증 및 작가 정보 조회
     */
    @PostMapping("/auth/author/verify-token")
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
                Long authorId = jwtTokenUtil.getAuthorIdFromToken(token);
                String email = jwtTokenUtil.getEmailFromToken(token);
                
                Optional<Author> authorOpt = authorRepository.findById(authorId);
                if (authorOpt.isPresent()) {
                    Author author = authorOpt.get();
                    response.put("success", true);
                    response.put("author", author);
                    response.put("authorId", author.getAuthorId());
                    response.put("tokenValid", true);
                    return ResponseEntity.ok(response);
                } else {
                    response.put("success", false);
                    response.put("error", "작가를 찾을 수 없습니다.");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }
            } else {
                response.put("success", false);
                response.put("error", "유효하지 않은 토큰입니다.");
                response.put("tokenValid", false);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Author token verification error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "토큰 검증 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 작가 정보 조회 (본인만 또는 기본 정보 공개)
     */
    @GetMapping("/auth/author/{id}")
    public ResponseEntity<Map<String, Object>> getAuthorById(
            @PathVariable("id") Long id,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Author> authorOpt = authorRepository.findById(id);
            if (authorOpt.isPresent()) {
                Author author = authorOpt.get();
                
                // JWT 토큰 체크 (있으면 전체 정보, 없으면 기본 정보만)
                String token = jwtTokenUtil.extractTokenFromHeader(request.getHeader("Authorization"));
                
                if (token != null && jwtTokenUtil.validateToken(token)) {
                    Long requestAuthorId = jwtTokenUtil.getAuthorIdFromToken(token);
                    if (requestAuthorId.equals(id)) {
                        // 본인 조회 - 전체 정보
                        response.put("success", true);
                        response.put("author", author);
                        return ResponseEntity.ok(response);
                    }
                }
                
                // 공개 정보만 반환
                Map<String, Object> publicInfo = new HashMap<>();
                publicInfo.put("authorId", author.getAuthorId());
                publicInfo.put("authorName", author.getAuthorName());
                publicInfo.put("realName", author.getRealName());
                
                response.put("success", true);
                response.put("author", publicInfo);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "작가를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving author: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 공개 작가 이름 조회
     */
    @GetMapping("/auth/authors/{id}/authorName")
    public ResponseEntity<Map<String, Object>> getAuthorName(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Author> authorOpt = authorRepository.findById(id);
            if (authorOpt.isPresent()) {
                Author author = authorOpt.get();
                
                response.put("success", true);
                response.put("authorId", author.getAuthorId());
                response.put("authorName", author.getAuthorName());
                response.put("realName", author.getRealName());
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "작가를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving author name: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 이름 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 패스워드 변경
     */
    @PostMapping("/auth/author/{id}/change-password")
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
            
            Long requestAuthorId = jwtTokenUtil.getAuthorIdFromToken(token);
            
            // 본인만 패스워드 변경 가능
            if (!requestAuthorId.equals(id)) {
                response.put("success", false);
                response.put("error", "본인의 패스워드만 변경할 수 있습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            Optional<Author> authorOpt = authorRepository.findById(id);
            if (authorOpt.isPresent()) {
                Author author = authorOpt.get();
                author.changePassword(currentPassword, newPassword);
                authorRepository.save(author);
                
                response.put("success", true);
                response.put("message", "패스워드가 성공적으로 변경되었습니다.");
                
                logger.info("Password changed successfully for author: {}", author.getEmail());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "작가를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (IllegalArgumentException e) {
            logger.warn("Author password change failed: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Author password change error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "패스워드 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 내부 회원가입 엔드포인트 (Auth 서비스에서만 호출)
     */
    @PostMapping("/authors/internal/register")
    public ResponseEntity<Map<String, Object>> internalRegisterAuthor(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String authorName = request.get("authorName");
            String email = request.get("email");
            String password = request.get("password");
            String realName = request.get("realName");
            String introduction = request.get("introduction");
            
            logger.info("Internal author registration attempt for email: {}", email);
            
            Author author = Author.registerAuthor(authorName, email, password, realName, introduction);
            
            response.put("success", true);
            response.put("message", "작가 등록이 완료되었습니다. 관리자의 승인을 기다려주세요.");
            response.put("author", author);
            response.put("status", "PENDING");
            
            logger.info("Author registered successfully via internal endpoint: {} (ID: {})", author.getAuthorName(), author.getAuthorId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Internal author registration failed - validation error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Internal author registration failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 등록 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 내부 로그인 엔드포인트 (Auth 서비스에서만 호출)
     */
    @PostMapping("/authors/internal/login")
    public ResponseEntity<Map<String, Object>> internalLoginAuthor(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            logger.info("Internal author login attempt for email: {}", email);
            
            Author author = Author.authenticateAuthor(email, password);
            
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("author", author);
            response.put("authorId", author.getAuthorId());
            
            logger.info("Author authenticated successfully via internal endpoint: {} (ID: {})", author.getAuthorName(), author.getAuthorId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.warn("Internal author login failed for email {}: {}", request.get("email"), e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            logger.error("Internal author login error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "로그인 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
