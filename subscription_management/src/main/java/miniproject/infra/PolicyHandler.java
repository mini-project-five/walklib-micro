package miniproject.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.transaction.Transactional;
import miniproject.config.kafka.KafkaProcessor;
import miniproject.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

//<<< Clean Arch / Inbound Adaptor
@Service
@Transactional
public class PolicyHandler {

    private static final Logger logger = LoggerFactory.getLogger(PolicyHandler.class);

    @Autowired
    SubscriptionRepository subscriptionRepository;

    /**
     * Point Service에서 포인트 차감 성공 이벤트 처리
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='PointsDeducted'"
    )
    public void whenPointsDeducted_then_ConfirmSubscriptionPayment(@Payload PointsDeducted pointsDeducted) {
        logger.info("Points deduction confirmed for user: {}, amount: {}", 
            pointsDeducted.getUserId(), pointsDeducted.getAmount());

        try {
            // 포인트 차감이 성공했으므로 구독 갱신 확정
            if ("SUBSCRIPTION_RENEWAL".equals(pointsDeducted.getDescription()) || 
                pointsDeducted.getDescription().contains("구독")) {
                
                // 해당 사용자의 정지된 구독을 재활성화
                subscriptionRepository.findByUserIdAndStatus(
                    pointsDeducted.getUserId(), 
                    Subscription.SubscriptionStatus.SUSPENDED
                ).ifPresent(subscription -> {
                    subscription.reactivate();
                    subscriptionRepository.save(subscription);
                    
                    logger.info("Subscription reactivated due to successful payment: {}", 
                        subscription.getSubscriptionId());
                });
            }
        } catch (Exception e) {
            logger.error("Error processing points deduction event: {}", e.getMessage(), e);
        }
    }

    /**
     * Point Service에서 포인트 부족 이벤트 처리
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='InsufficientPoints'"
    )
    public void whenInsufficientPoints_then_HandleSubscriptionFailure(@Payload InsufficientPoints insufficientPoints) {
        logger.info("Insufficient points detected for user: {}", insufficientPoints.getUserId());

        try {
            // 포인트 부족으로 인한 구독 갱신 실패 처리
            Subscription.handlePointsInsufficient(insufficientPoints.getUserId());
            
            logger.info("Handled insufficient points for user: {}", insufficientPoints.getUserId());
        } catch (Exception e) {
            logger.error("Error handling insufficient points event: {}", e.getMessage(), e);
        }
    }

    /**
     * User Service에서 사용자 생성 이벤트 처리
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='UserCreated'"
    )
    public void whenUserCreated_then_InitializeSubscriptionData(@Payload UserCreated userCreated) {
        logger.info("User created event received for user: {}", userCreated.getUserId());

        try {
            // 신규 사용자를 위한 구독 관련 초기화 작업 (필요시)
            // 예: 무료 체험 구독 자동 생성 등
            
            logger.info("Processed user creation for subscription service: {}", userCreated.getUserId());
        } catch (Exception e) {
            logger.error("Error processing user creation event: {}", e.getMessage(), e);
        }
    }

    /**
     * Point Service에서 포인트 충전 이벤트 처리
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='PointsAdded'"
    )
    public void whenPointsAdded_then_CheckSuspendedSubscriptions(@Payload PointsAdded pointsAdded) {
        logger.info("Points added for user: {}, amount: {}", 
            pointsAdded.getUserId(), pointsAdded.getAmount());

        try {
            // 포인트 충전 후 정지된 구독이 있는지 확인하고 자동 갱신 재시도
            subscriptionRepository.findByUserIdAndStatus(
                pointsAdded.getUserId(), 
                Subscription.SubscriptionStatus.SUSPENDED
            ).ifPresent(subscription -> {
                // 포인트가 충분하면 갱신 재시도
                if (pointsAdded.getAmount() >= subscription.getMonthlyCost()) {
                    try {
                        subscription.reactivate();
                        subscriptionRepository.save(subscription);
                        
                        logger.info("Subscription reactivated after points addition: {}", 
                            subscription.getSubscriptionId());
                    } catch (Exception e) {
                        logger.warn("Failed to reactivate subscription after points addition: {}", e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            logger.error("Error processing points addition event: {}", e.getMessage(), e);
        }
    }

    /**
     * 일반적인 이벤트 처리 (디버깅용)
     */
    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {
        // 디버깅을 위한 일반적인 이벤트 로깅
        if (logger.isDebugEnabled()) {
            logger.debug("Received event: {}", eventString);
        }
    }

    // 이벤트 클래스 정의
    public static class PointsDeducted {
        private Long userId;
        private Integer amount;
        private String description;
        
        // getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class InsufficientPoints {
        private Long userId;
        private Integer requestedAmount;
        private Integer availableAmount;
        
        // getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public Integer getRequestedAmount() { return requestedAmount; }
        public void setRequestedAmount(Integer requestedAmount) { this.requestedAmount = requestedAmount; }
        
        public Integer getAvailableAmount() { return availableAmount; }
        public void setAvailableAmount(Integer availableAmount) { this.availableAmount = availableAmount; }
    }

    public static class UserCreated {
        private Long userId;
        private String email;
        
        // getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class PointsAdded {
        private Long userId;
        private Integer amount;
        private String description;
        
        // getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}
//>>> Clean Arch / Inbound Adaptor
