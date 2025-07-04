package miniproject.infra;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/subscriptions")
@Transactional
public class SubscriptionController {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionController.class);

    @Autowired
    SubscriptionRepository subscriptionRepository;

    // 사용자의 활성 구독 조회
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<Subscription> getActiveSubscription(@PathVariable Long userId) {
        logger.info("GET /subscriptions/user/{}/active - 활성 구독 조회", userId);
        
        List<Subscription> subscriptions = subscriptionRepository.findByUserIdAndStatus(userId, "ACTIVE");
        
        // 현재 시간 기준으로 유효한 구독 찾기
        Date now = new Date();
        Optional<Subscription> activeSubscription = subscriptions.stream()
            .filter(sub -> sub.getEndDate().after(now))
            .findFirst();
        
        if (activeSubscription.isPresent()) {
            logger.info("활성 구독 조회 성공: 사용자 ID={}, 만료일={}", 
                       userId, activeSubscription.get().getEndDate());
            return ResponseEntity.ok(activeSubscription.get());
        } else {
            logger.info("활성 구독 없음: 사용자 ID={}", userId);
            return ResponseEntity.notFound().build();
        }
    }

    // 프리미엄 구독 신청 (월 9,900원)
    @PostMapping("/subscribe")
    public ResponseEntity<Subscription> subscribe(@RequestBody SubscribeRequest request) {
        logger.info("POST /subscriptions/subscribe - 프리미엄 구독 신청: userId={}", request.getUserId());
        
        // 기존 활성 구독이 있는지 확인
        List<Subscription> existingSubscriptions = subscriptionRepository.findByUserIdAndStatus(request.getUserId(), "ACTIVE");
        Date now = new Date();
        
        boolean hasActiveSubscription = existingSubscriptions.stream()
            .anyMatch(sub -> sub.getEndDate().after(now));
        
        if (hasActiveSubscription) {
            logger.warn("이미 활성 구독이 있음: 사용자 ID={}", request.getUserId());
            return ResponseEntity.badRequest().build();
        }
        
        // 새 구독 생성 (1개월)
        Calendar cal = Calendar.getInstance();
        Date startDate = cal.getTime();
        cal.add(Calendar.MONTH, 1);
        Date endDate = cal.getTime();
        
        Subscription subscription = new Subscription();
        subscription.setUserId(request.getUserId());
        subscription.setStatus("ACTIVE");
        subscription.setPlanType("PREMIUM");
        subscription.setMonthlyFee(9900);
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        
        Subscription savedSubscription = subscriptionRepository.save(subscription);
        logger.info("프리미엄 구독 신청 완료: 사용자 ID={}, 시작일={}, 만료일={}", 
                   request.getUserId(), startDate, endDate);
        
        return ResponseEntity.ok(savedSubscription);
    }

    // 구독 취소
    @PatchMapping("/{subscriptionId}/cancel")
    public ResponseEntity<Subscription> cancelSubscription(@PathVariable Long subscriptionId) {
        logger.info("PATCH /subscriptions/{}/cancel - 구독 취소", subscriptionId);
        
        Optional<Subscription> subscriptionOptional = subscriptionRepository.findById(subscriptionId);
        if (subscriptionOptional.isPresent()) {
            Subscription subscription = subscriptionOptional.get();
            subscription.setStatus("INACTIVE");
            
            Subscription updatedSubscription = subscriptionRepository.save(subscription);
            logger.info("구독 취소 완료: ID={}", subscriptionId);
            return ResponseEntity.ok(updatedSubscription);
        } else {
            logger.warn("취소할 구독을 찾을 수 없음: ID={}", subscriptionId);
            return ResponseEntity.notFound().build();
        }
    }

    // 사용자의 모든 구독 내역 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Subscription>> getUserSubscriptions(@PathVariable Long userId) {
        logger.info("GET /subscriptions/user/{} - 사용자 구독 내역 조회", userId);
        List<Subscription> subscriptions = subscriptionRepository.findByUserId(userId);
        logger.info("사용자 ID {}의 구독 내역 수: {}", userId, subscriptions.size());
        return ResponseEntity.ok(subscriptions);
    }

    // 구독 상태 확인 (구독자인지 확인)
    @GetMapping("/user/{userId}/status")
    public ResponseEntity<SubscriptionStatus> getSubscriptionStatus(@PathVariable Long userId) {
        logger.info("GET /subscriptions/user/{}/status - 구독 상태 확인", userId);
        
        List<Subscription> subscriptions = subscriptionRepository.findByUserIdAndStatus(userId, "ACTIVE");
        Date now = new Date();
        
        boolean isSubscriber = subscriptions.stream()
            .anyMatch(sub -> sub.getEndDate().after(now));
        
        SubscriptionStatus status = new SubscriptionStatus();
        status.setUserId(userId);
        status.setIsSubscriber(isSubscriber);
        
        if (isSubscriber) {
            Optional<Subscription> activeSub = subscriptions.stream()
                .filter(sub -> sub.getEndDate().after(now))
                .findFirst();
            if (activeSub.isPresent()) {
                status.setEndDate(activeSub.get().getEndDate());
                status.setPlanType(activeSub.get().getPlanType());
            }
        }
        
        logger.info("구독 상태 조회 완료: 사용자 ID={}, 구독자={}", userId, isSubscriber);
        return ResponseEntity.ok(status);
    }

    // 요청 DTO 클래스들
    public static class SubscribeRequest {
        private Long userId;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }
    
    public static class SubscriptionStatus {
        private Long userId;
        private boolean isSubscriber;
        private String planType;
        private Date endDate;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public boolean getIsSubscriber() { return isSubscriber; }
        public void setIsSubscriber(boolean isSubscriber) { this.isSubscriber = isSubscriber; }
        public String getPlanType() { return planType; }
        public void setPlanType(String planType) { this.planType = planType; }
        public Date getEndDate() { return endDate; }
        public void setEndDate(Date endDate) { this.endDate = endDate; }
    }
}
//>>> Clean Arch / Inbound Adaptor
