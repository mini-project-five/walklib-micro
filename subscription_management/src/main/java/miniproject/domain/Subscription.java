package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.Data;
import miniproject.SubscriptionManagementApplication;
import miniproject.domain.SubscriptionActivated;
import miniproject.domain.SubscriptionCanceled;

@Entity
@Table(name = "Subscription_table", indexes = {
    @Index(name = "idx_subscription_user_status", columnList = "userId, status"),
    @Index(name = "idx_subscription_end_date", columnList = "endDate"),
    @Index(name = "idx_subscription_status", columnList = "status")
})
@Data
//<<< DDD / Aggregate Root
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long subscriptionId;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE; // ACTIVE, CANCELED, EXPIRED, SUSPENDED
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType planType; // BASIC, PREMIUM
    
    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer monthlyCost;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date endDate;

    // 추가 필드들
    @Temporal(TemporalType.TIMESTAMP)
    private Date nextBillingDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date lastBillingDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date canceledAt;

    private String cancelReason;

    private Boolean autoRenewal = true;

    private Integer renewalAttempts = 0;

    // Enum 정의
    public enum SubscriptionStatus {
        ACTIVE("활성"),
        CANCELED("취소됨"),
        EXPIRED("만료됨"),
        SUSPENDED("정지됨");

        private final String displayName;

        SubscriptionStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum PlanType {
        BASIC("베이직", 9900),
        PREMIUM("프리미엄", 29900);

        private final String displayName;
        private final Integer cost;

        PlanType(String displayName, Integer cost) {
            this.displayName = displayName;
            this.cost = cost;
        }

        public String getDisplayName() {
            return displayName;
        }

        public Integer getCost() {
            return cost;
        }
    }

    @PostPersist
    public void onPostPersist() {
        // Only publish SubscriptionActivated event when creating new active subscription
        if (SubscriptionStatus.ACTIVE.equals(this.status)) {
            SubscriptionActivated subscriptionActivated = new SubscriptionActivated(this);
            subscriptionActivated.publishAfterCommit();
        }
    }

    public static SubscriptionRepository repository() {
        SubscriptionRepository subscriptionRepository = SubscriptionManagementApplication.applicationContext.getBean(
            SubscriptionRepository.class
        );
        return subscriptionRepository;
    }
    
    //<<< Clean Arch / Port Method
    public static void activateSubscription(Long userId, PlanType planType) {
        validateUserId(userId);
        validatePlanType(planType);
        
        System.out.println("Activating subscription for user: " + userId + ", plan: " + planType.getDisplayName());
        
        // Check if user already has active subscription
        repository().findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE).ifPresentOrElse(
            subscription -> {
                System.out.println("User already has active subscription: " + subscription.getSubscriptionId());
                throw new IllegalStateException("사용자가 이미 활성 구독을 보유하고 있습니다.");
            },
            () -> {
                // Create new subscription
                Subscription subscription = new Subscription();
                subscription.setUserId(userId);
                subscription.setPlanType(planType);
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscription.setMonthlyCost(planType.getCost());
                
                Date now = new Date();
                subscription.setStartDate(now);
                subscription.setLastBillingDate(now);
                
                // Set end date (1 month later)
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.setTime(now);
                cal.add(java.util.Calendar.MONTH, 1);
                subscription.setEndDate(cal.getTime());
                subscription.setNextBillingDate(cal.getTime());
                
                subscription.setAutoRenewal(true);
                subscription.setRenewalAttempts(0);
                
                repository().save(subscription);
                
                System.out.println("Subscription activated successfully: " + subscription.getSubscriptionId());
            }
        );
    }
    
    public static void cancelSubscription(Long userId, String reason) {
        validateUserId(userId);
        
        System.out.println("Canceling subscription for user: " + userId + ", reason: " + reason);
        
        repository().findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE).ifPresentOrElse(
            subscription -> {
                subscription.setStatus(SubscriptionStatus.CANCELED);
                subscription.setEndDate(new Date()); // End immediately
                subscription.setCanceledAt(new Date());
                subscription.setCancelReason(reason != null ? reason : "사용자 요청");
                subscription.setAutoRenewal(false);
                
                repository().save(subscription);
                
                SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(subscription);
                subscriptionCanceled.publishAfterCommit();
                
                System.out.println("Subscription canceled: " + subscription.getSubscriptionId());
            },
            () -> {
                System.out.println("No active subscription found for user: " + userId);
                throw new IllegalStateException("활성 구독을 찾을 수 없습니다.");
            }
        );
    }
    
    public static void handlePointsInsufficient(Long userId) {
        validateUserId(userId);
        
        System.out.println("Handling insufficient points for user: " + userId);
        
        repository().findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE).ifPresent(subscription -> {
            subscription.incrementRenewalAttempts();
            
            // 3회 갱신 실패 시 구독 취소
            if (subscription.getRenewalAttempts() >= 3) {
                subscription.setStatus(SubscriptionStatus.CANCELED);
                subscription.setEndDate(new Date());
                subscription.setCanceledAt(new Date());
                subscription.setCancelReason("포인트 부족으로 인한 자동 취소 (3회 갱신 실패)");
                subscription.setAutoRenewal(false);
                
                SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(subscription);
                subscriptionCanceled.publishAfterCommit();
                
                System.out.println("Subscription canceled due to insufficient points after 3 attempts: " + subscription.getSubscriptionId());
            } else {
                // 일시 정지 (24시간 후 재시도)
                subscription.setStatus(SubscriptionStatus.SUSPENDED);
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.add(java.util.Calendar.DAY_OF_MONTH, 1);
                subscription.setNextBillingDate(cal.getTime());
                
                System.out.println("Subscription suspended due to insufficient points (attempt " + 
                    subscription.getRenewalAttempts() + "/3): " + subscription.getSubscriptionId());
            }
            
            repository().save(subscription);
        });
    }
    
    // 비즈니스 로직 메서드들
    public void incrementRenewalAttempts() {
        this.renewalAttempts = (this.renewalAttempts != null ? this.renewalAttempts : 0) + 1;
    }
    
    public void resetRenewalAttempts() {
        this.renewalAttempts = 0;
    }
    
    public boolean isExpired() {
        return this.endDate != null && this.endDate.before(new Date());
    }
    
    public boolean canRenew() {
        return SubscriptionStatus.ACTIVE.equals(this.status) && 
               Boolean.TRUE.equals(this.autoRenewal) && 
               !isExpired();
    }
    
    public boolean isSuspended() {
        return SubscriptionStatus.SUSPENDED.equals(this.status);
    }
    
    public void reactivate() {
        if (SubscriptionStatus.SUSPENDED.equals(this.status)) {
            this.status = SubscriptionStatus.ACTIVE;
            this.resetRenewalAttempts();
            
            // 다음 결제일을 1개월 연장
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(new Date());
            cal.add(java.util.Calendar.MONTH, 1);
            this.setEndDate(cal.getTime());
            this.setNextBillingDate(cal.getTime());
            this.setLastBillingDate(new Date());
        } else {
            throw new IllegalStateException("정지된 구독만 재활성화할 수 있습니다.");
        }
    }
    
    public void expire() {
        if (SubscriptionStatus.ACTIVE.equals(this.status) || 
            SubscriptionStatus.SUSPENDED.equals(this.status)) {
            this.status = SubscriptionStatus.EXPIRED;
            this.setAutoRenewal(false);
        }
    }
    
    // 검증 메서드들
    private static void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("유효하지 않은 사용자 ID입니다.");
        }
    }
    
    private static void validatePlanType(PlanType planType) {
        if (planType == null) {
            throw new IllegalArgumentException("구독 플랜 타입이 필수입니다.");
        }
    }
    
    // 자동 만료 처리를 위한 정적 메서드
    public static void processExpiredSubscriptions() {
        Date now = new Date();
        List<Subscription> expiredSubscriptions = repository().findByEndDateBeforeAndStatusIn(
            now, 
            Arrays.asList(SubscriptionStatus.ACTIVE, SubscriptionStatus.SUSPENDED)
        );
        
        for (Subscription subscription : expiredSubscriptions) {
            subscription.expire();
            repository().save(subscription);
            
            SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(subscription);
            subscriptionCanceled.publishAfterCommit();
            
            System.out.println("Subscription expired: " + subscription.getSubscriptionId());
        }
    }
    
    // 자동 갱신 처리를 위한 정적 메서드
    public static void processAutoRenewal() {
        Date now = new Date();
        List<Subscription> renewalCandidates = repository().findByNextBillingDateBeforeAndStatusAndAutoRenewal(
            now, 
            SubscriptionStatus.ACTIVE, 
            true
        );
        
        for (Subscription subscription : renewalCandidates) {
            try {
                System.out.println("Processing auto-renewal for subscription: " + subscription.getSubscriptionId());
                
                // Point Service에 갱신 결제 요청 이벤트 발행
                // 실제 결제 결과는 PolicyHandler에서 처리
                publishSubscriptionRenewalRequest(
                    subscription.getUserId(), 
                    subscription.getSubscriptionId(), 
                    subscription.getMonthlyCost()
                );
                
                System.out.println("Auto-renewal payment request sent for subscription: " + subscription.getSubscriptionId());
                
            } catch (Exception e) {
                System.err.println("Auto-renewal request failed for subscription: " + subscription.getSubscriptionId() + ", error: " + e.getMessage());
                // 요청 실패 시 즉시 insufficient points 처리
                handlePointsInsufficient(subscription.getUserId());
            }
        }
    }
    
    // 이벤트 발행 헬퍼 메서드들
    private static void publishSubscriptionRenewalRequest(Long userId, Long subscriptionId, Integer amount) {
        try {
            // ApplicationContext를 통해 EventPublisher Bean 가져오기
            Object eventPublisher = SubscriptionManagementApplication.applicationContext.getBean(
                "subscriptionEventPublisher"
            );
            
            // 리플렉션을 사용하여 메서드 호출
            eventPublisher.getClass()
                .getMethod("publishSubscriptionRenewalRequest", Long.class, Long.class, Integer.class)
                .invoke(eventPublisher, userId, subscriptionId, amount);
                
        } catch (Exception e) {
            System.err.println("Failed to publish subscription renewal request: " + e.getMessage());
            throw new RuntimeException("Failed to publish renewal request", e);
        }
    }
    //>>> Clean Arch / Port Method
}
//>>> DDD / Aggregate Root
