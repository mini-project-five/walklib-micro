package miniproject.infra;

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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/subscriptions")
@Transactional
public class SubscriptionController {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionController.class);

    @Autowired
    SubscriptionRepository subscriptionRepository;

    /**
     * 구독 활성화 (사용자 요청)
     */
    @PostMapping("/activate")
    public ResponseEntity<Map<String, Object>> activateSubscription(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String planTypeStr = request.get("planType").toString();
            
            // planType 문자열을 enum으로 변환
            Subscription.PlanType planType;
            try {
                planType = Subscription.PlanType.valueOf(planTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                response.put("success", false);
                response.put("error", "유효하지 않은 플랜 타입입니다: " + planTypeStr);
                return ResponseEntity.badRequest().body(response);
            }
            
            logger.info("Subscription activation request - userId: {}, planType: {}", userId, planType);
            
            Subscription.activateSubscription(userId, planType);
            
            response.put("success", true);
            response.put("message", "구독이 성공적으로 활성화되었습니다.");
            
            // 생성된 구독 정보 반환
            Optional<Subscription> subscription = subscriptionRepository.findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.ACTIVE);
            if (subscription.isPresent()) {
                response.put("subscription", subscription.get());
            }
            
            logger.info("Subscription activated successfully for user: {}", userId);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Subscription activation failed - validation error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalStateException e) {
            logger.warn("Subscription activation failed - business rule error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Subscription activation failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "구독 활성화 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 구독 취소 (사용자 요청)
     */
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancelSubscription(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String reason = request.containsKey("reason") ? request.get("reason").toString() : "사용자 요청";
            
            logger.info("Subscription cancellation request - userId: {}, reason: {}", userId, reason);
            
            Subscription.cancelSubscription(userId, reason);
            
            response.put("success", true);
            response.put("message", "구독이 성공적으로 취소되었습니다.");
            
            logger.info("Subscription canceled successfully for user: {}", userId);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Subscription cancellation failed - validation error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalStateException e) {
            logger.warn("Subscription cancellation failed - business rule error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Subscription cancellation failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "구독 취소 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 사용자별 구독 목록 조회
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getSubscriptionsByUser(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Retrieving subscriptions for user: {}", userId);
            
            List<Subscription> subscriptions = subscriptionRepository.findByUserId(userId);
            
            response.put("success", true);
            response.put("subscriptions", subscriptions);
            response.put("count", subscriptions.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving subscriptions for user {}: {}", userId, e.getMessage(), e);
            response.put("success", false);
            response.put("error", "구독 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 활성 구독 조회 (사용자별)
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<Map<String, Object>> getActiveSubscription(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Retrieving active subscription for user: {}", userId);
            
            Optional<Subscription> subscription = subscriptionRepository.findByUserIdAndStatus(
                userId, Subscription.SubscriptionStatus.ACTIVE);
            
            if (subscription.isPresent()) {
                response.put("success", true);
                response.put("subscription", subscription.get());
                response.put("hasActiveSubscription", true);
            } else {
                response.put("success", true);
                response.put("subscription", null);
                response.put("hasActiveSubscription", false);
                response.put("message", "활성 구독이 없습니다.");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving active subscription for user {}: {}", userId, e.getMessage(), e);
            response.put("success", false);
            response.put("error", "활성 구독 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 구독 상세 조회
     */
    @GetMapping("/{subscriptionId}")
    public ResponseEntity<Map<String, Object>> getSubscription(@PathVariable Long subscriptionId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Retrieving subscription: {}", subscriptionId);
            
            Optional<Subscription> subscription = subscriptionRepository.findById(subscriptionId);
            
            if (subscription.isPresent()) {
                response.put("success", true);
                response.put("subscription", subscription.get());
            } else {
                response.put("success", false);
                response.put("error", "구독을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving subscription {}: {}", subscriptionId, e.getMessage(), e);
            response.put("success", false);
            response.put("error", "구독 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 정지된 구독 재활성화
     */
    @PostMapping("/{subscriptionId}/reactivate")
    public ResponseEntity<Map<String, Object>> reactivateSubscription(@PathVariable Long subscriptionId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Reactivating subscription: {}", subscriptionId);
            
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findById(subscriptionId);
            
            if (subscriptionOpt.isPresent()) {
                Subscription subscription = subscriptionOpt.get();
                subscription.reactivate();
                subscriptionRepository.save(subscription);
                
                response.put("success", true);
                response.put("message", "구독이 성공적으로 재활성화되었습니다.");
                response.put("subscription", subscription);
                
                logger.info("Subscription reactivated successfully: {}", subscriptionId);
            } else {
                response.put("success", false);
                response.put("error", "구독을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            logger.warn("Subscription reactivation failed - business rule error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Subscription reactivation failed - system error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "구독 재활성화 처리 중 시스템 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 구독 통계 조회 (관리자용)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSubscriptionStats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Retrieving subscription statistics");
            
            Map<String, Object> stats = new HashMap<>();
            
            // 상태별 구독 수
            for (Subscription.SubscriptionStatus status : Subscription.SubscriptionStatus.values()) {
                List<Subscription> subscriptions = subscriptionRepository.findByStatus(status);
                stats.put(status.name().toLowerCase() + "Count", subscriptions.size());
            }
            
            // 플랜별 구독 수
            for (Subscription.PlanType planType : Subscription.PlanType.values()) {
                List<Subscription> subscriptions = subscriptionRepository.findByPlanType(planType);
                stats.put(planType.name().toLowerCase() + "Count", subscriptions.size());
            }
            
            response.put("success", true);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving subscription statistics: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "구독 통계 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 자동 만료 처리 (스케줄러용)
     */
    @PostMapping("/process-expired")
    public ResponseEntity<Map<String, Object>> processExpiredSubscriptions() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Processing expired subscriptions");
            
            Subscription.processExpiredSubscriptions();
            
            response.put("success", true);
            response.put("message", "만료된 구독 처리가 완료되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error processing expired subscriptions: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "만료 구독 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 자동 갱신 처리 (스케줄러용)
     */
    @PostMapping("/process-auto-renewal")
    public ResponseEntity<Map<String, Object>> processAutoRenewal() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Processing auto-renewal subscriptions");
            
            Subscription.processAutoRenewal();
            
            response.put("success", true);
            response.put("message", "자동 갱신 처리가 완료되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error processing auto-renewal: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "자동 갱신 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
