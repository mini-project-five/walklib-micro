package miniproject.infra;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/admin/authors")
@Transactional
public class AuthorManagementController {

    private static final Logger logger = LoggerFactory.getLogger(AuthorManagementController.class);

    @Autowired
    AuthorManagementRepository authorManagementRepository;

    @Autowired
    AuthorRepository authorRepository;

    /**
     * 승인 대기 중인 작가 목록 조회 (관리자 전용)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPendingAuthors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuthorManagement> pendingAuthors = authorManagementRepository
                .findByManagementStatusOrderByReviewedAtDesc(ManagementStatus.PENDING, pageable);
            
            response.put("success", true);
            response.put("authors", pendingAuthors.getContent());
            response.put("totalElements", pendingAuthors.getTotalElements());
            response.put("totalPages", pendingAuthors.getTotalPages());
            response.put("currentPage", page);
            
            logger.info("Retrieved {} pending authors for admin review", pendingAuthors.getTotalElements());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving pending authors: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "승인 대기 작가 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 모든 작가 승인 요청 조회 (관리자 전용)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllAuthorRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuthorManagement> authors;
            
            if (status != null && !status.trim().isEmpty()) {
                ManagementStatus managementStatus = ManagementStatus.valueOf(status.trim().toUpperCase());
                authors = authorManagementRepository.findByManagementStatusOrderByReviewedAtDesc(managementStatus, pageable);
            } else {
                authors = authorManagementRepository.findAllByOrderByReviewedAtDesc(pageable);
            }
            
            response.put("success", true);
            response.put("authors", authors.getContent());
            response.put("totalElements", authors.getTotalElements());
            response.put("totalPages", authors.getTotalPages());
            response.put("currentPage", page);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving author requests: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 승인 요청 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 작가 승인 처리 (관리자 전용)
     */
    @PostMapping("/{authorId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveAuthor(
            @PathVariable Long authorId,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String adminNotes = request.getOrDefault("adminNotes", "관리자 승인");
            
            logger.info("Admin approving author: {}", authorId);
            
            // AuthorManagement에서 승인 처리
            Optional<AuthorManagement> authorMgmtOpt = authorManagementRepository.findByAuthorId(authorId);
            
            if (authorMgmtOpt.isPresent()) {
                AuthorManagement authorMgmt = authorMgmtOpt.get();
                authorMgmt.setManagementStatus(ManagementStatus.APPROVED);
                authorMgmt.setReviewedAt(new Date());
                authorManagementRepository.save(authorMgmt);
                
                // Author 엔티티도 승인 상태로 변경
                Optional<Author> authorOpt = authorRepository.findById(authorId);
                if (authorOpt.isPresent()) {
                    Author author = authorOpt.get();
                    author.approve();
                    authorRepository.save(author);
                }
                
                // 승인 이벤트 발행
                AuthorApproved authorApproved = new AuthorApproved();
                authorApproved.setAuthorId(authorId);
                authorApproved.setAuthorName(authorMgmt.getAuthorName());
                authorApproved.setEmail(authorMgmt.getEmail());
                authorApproved.publishAfterCommit();
                
                response.put("success", true);
                response.put("message", "작가가 성공적으로 승인되었습니다.");
                response.put("authorManagement", authorMgmt);
                
                logger.info("Author approved successfully: {} by admin", authorId);
                return ResponseEntity.ok(response);
                
            } else {
                response.put("success", false);
                response.put("error", "작가 승인 요청을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (IllegalStateException e) {
            logger.warn("Author approval failed - business rule error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Author approval failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 승인 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 작가 거부 처리 (관리자 전용)
     */
    @PostMapping("/{authorId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectAuthor(
            @PathVariable Long authorId,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String rejectionReason = request.getOrDefault("rejectionReason", "관리자 판단에 의한 거부");
            String adminNotes = request.getOrDefault("adminNotes", rejectionReason);
            
            logger.info("Admin rejecting author: {} with reason: {}", authorId, rejectionReason);
            
            // AuthorManagement에서 거부 처리
            Optional<AuthorManagement> authorMgmtOpt = authorManagementRepository.findByAuthorId(authorId);
            
            if (authorMgmtOpt.isPresent()) {
                AuthorManagement authorMgmt = authorMgmtOpt.get();
                authorMgmt.setManagementStatus(ManagementStatus.REJECTED);
                authorMgmt.setReviewedAt(new Date());
                authorManagementRepository.save(authorMgmt);
                
                // Author 엔티티도 거부 상태로 변경
                Optional<Author> authorOpt = authorRepository.findById(authorId);
                if (authorOpt.isPresent()) {
                    Author author = authorOpt.get();
                    author.reject();
                    authorRepository.save(author);
                }
                
                // 거부 이벤트 발행
                AuthorRejected authorRejected = new AuthorRejected();
                authorRejected.setAuthorId(authorId);
                authorRejected.setAuthorName(authorMgmt.getAuthorName());
                authorRejected.setEmail(authorMgmt.getEmail());
                authorRejected.publishAfterCommit();
                
                response.put("success", true);
                response.put("message", "작가 요청이 성공적으로 거부되었습니다.");
                response.put("authorManagement", authorMgmt);
                
                logger.info("Author rejected successfully: {} by admin", authorId);
                return ResponseEntity.ok(response);
                
            } else {
                response.put("success", false);
                response.put("error", "작가 승인 요청을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (IllegalStateException e) {
            logger.warn("Author rejection failed - business rule error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Author rejection failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 거부 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 작가 승인 상세 정보 조회 (관리자 전용)
     */
    @GetMapping("/{authorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuthorDetail(@PathVariable Long authorId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<AuthorManagement> authorMgmtOpt = authorManagementRepository.findByAuthorId(authorId);
            
            if (authorMgmtOpt.isPresent()) {
                AuthorManagement authorMgmt = authorMgmtOpt.get();
                
                // Author 정보도 함께 조회
                Optional<Author> authorOpt = authorRepository.findById(authorId);
                
                response.put("success", true);
                response.put("authorManagement", authorMgmt);
                if (authorOpt.isPresent()) {
                    response.put("author", authorOpt.get());
                }
                
                return ResponseEntity.ok(response);
                
            } else {
                response.put("success", false);
                response.put("error", "작가 정보를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving author detail: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 작가 승인 통계 조회 (관리자 대시보드용)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuthorStats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // 상태별 작가 수
            long pendingCount = authorManagementRepository.countByManagementStatus(ManagementStatus.PENDING);
            long approvedCount = authorManagementRepository.countByManagementStatus(ManagementStatus.APPROVED);
            long rejectedCount = authorManagementRepository.countByManagementStatus(ManagementStatus.REJECTED);
            long underReviewCount = 0; // UNDER_REVIEW status not in enum
            
            stats.put("pendingCount", pendingCount);
            stats.put("approvedCount", approvedCount);
            stats.put("rejectedCount", rejectedCount);
            stats.put("underReviewCount", underReviewCount);
            stats.put("totalRequests", pendingCount + approvedCount + rejectedCount + underReviewCount);
            
            // 승인률 계산
            long totalProcessed = approvedCount + rejectedCount;
            double approvalRate = totalProcessed > 0 ? (double) approvedCount / totalProcessed * 100 : 0;
            stats.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);
            
            response.put("success", true);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving author stats: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 통계 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
