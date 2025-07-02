package miniproject.infra;

import miniproject.config.kafka.KafkaProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 구독 서비스에서 다른 서비스로 이벤트 발행
 * Point Service와의 연동을 위한 이벤트 발행기
 */
@Component
public class SubscriptionEventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionEventPublisher.class);

    @Autowired
    private KafkaProcessor processor;

    /**
     * 구독 결제 요청 이벤트 발행 (Point Service로)
     */
    public void publishSubscriptionPaymentRequest(Long userId, Integer amount, String description, Long subscriptionId) {
        logger.info("Publishing subscription payment request - userId: {}, amount: {}, subscriptionId: {}", 
            userId, amount, subscriptionId);

        try {
            Map<String, Object> event = new HashMap<>();
            event.put("userId", userId);
            event.put("amount", amount);
            event.put("description", description);
            event.put("subscriptionId", subscriptionId);
            event.put("eventType", "SUBSCRIPTION_PAYMENT_REQUEST");
            event.put("timestamp", System.currentTimeMillis());

            MessageChannel outputChannel = processor.output();
            outputChannel.send(MessageBuilder
                .withPayload(event)
                .setHeader("type", "SubscriptionPaymentRequest")
                .build());

            logger.info("Successfully published subscription payment request for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to publish subscription payment request: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription payment request", e);
        }
    }

    /**
     * 구독 활성화 이벤트 발행
     */
    public void publishSubscriptionActivated(Long userId, Long subscriptionId, String planType, Integer cost) {
        logger.info("Publishing subscription activated event - userId: {}, subscriptionId: {}", userId, subscriptionId);

        try {
            Map<String, Object> event = new HashMap<>();
            event.put("userId", userId);
            event.put("subscriptionId", subscriptionId);
            event.put("planType", planType);
            event.put("cost", cost);
            event.put("eventType", "SUBSCRIPTION_ACTIVATED");
            event.put("timestamp", System.currentTimeMillis());

            MessageChannel outputChannel = processor.output();
            outputChannel.send(MessageBuilder
                .withPayload(event)
                .setHeader("type", "SubscriptionActivated")
                .build());

            logger.info("Successfully published subscription activated event for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to publish subscription activated event: {}", e.getMessage(), e);
        }
    }

    /**
     * 구독 취소 이벤트 발행
     */
    public void publishSubscriptionCanceled(Long userId, Long subscriptionId, String reason) {
        logger.info("Publishing subscription canceled event - userId: {}, subscriptionId: {}", userId, subscriptionId);

        try {
            Map<String, Object> event = new HashMap<>();
            event.put("userId", userId);
            event.put("subscriptionId", subscriptionId);
            event.put("reason", reason);
            event.put("eventType", "SUBSCRIPTION_CANCELED");
            event.put("timestamp", System.currentTimeMillis());

            MessageChannel outputChannel = processor.output();
            outputChannel.send(MessageBuilder
                .withPayload(event)
                .setHeader("type", "SubscriptionCanceled")
                .build());

            logger.info("Successfully published subscription canceled event for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to publish subscription canceled event: {}", e.getMessage(), e);
        }
    }

    /**
     * 구독 갱신 요청 이벤트 발행
     */
    public void publishSubscriptionRenewalRequest(Long userId, Long subscriptionId, Integer amount) {
        logger.info("Publishing subscription renewal request - userId: {}, subscriptionId: {}, amount: {}", 
            userId, subscriptionId, amount);

        try {
            Map<String, Object> event = new HashMap<>();
            event.put("userId", userId);
            event.put("subscriptionId", subscriptionId);
            event.put("amount", amount);
            event.put("description", "구독 자동 갱신");
            event.put("eventType", "SUBSCRIPTION_RENEWAL_REQUEST");
            event.put("timestamp", System.currentTimeMillis());

            MessageChannel outputChannel = processor.output();
            outputChannel.send(MessageBuilder
                .withPayload(event)
                .setHeader("type", "SubscriptionRenewalRequest")
                .build());

            logger.info("Successfully published subscription renewal request for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to publish subscription renewal request: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish subscription renewal request", e);
        }
    }

    /**
     * 구독 정지 이벤트 발행
     */
    public void publishSubscriptionSuspended(Long userId, Long subscriptionId, String reason, Integer attemptCount) {
        logger.info("Publishing subscription suspended event - userId: {}, subscriptionId: {}", userId, subscriptionId);

        try {
            Map<String, Object> event = new HashMap<>();
            event.put("userId", userId);
            event.put("subscriptionId", subscriptionId);
            event.put("reason", reason);
            event.put("attemptCount", attemptCount);
            event.put("eventType", "SUBSCRIPTION_SUSPENDED");
            event.put("timestamp", System.currentTimeMillis());

            MessageChannel outputChannel = processor.output();
            outputChannel.send(MessageBuilder
                .withPayload(event)
                .setHeader("type", "SubscriptionSuspended")
                .build());

            logger.info("Successfully published subscription suspended event for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to publish subscription suspended event: {}", e.getMessage(), e);
        }
    }
}