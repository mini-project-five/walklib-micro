package miniproject.infra;

import miniproject.domain.Subscription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 구독 관련 스케줄러
 * - 만료된 구독 자동 처리
 * - 자동 갱신 처리
 */
@Component
public class SubscriptionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionScheduler.class);

    /**
     * 만료된 구독 처리 (매일 자정 실행)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void processExpiredSubscriptions() {
        logger.info("Starting scheduled processing of expired subscriptions");
        
        try {
            Subscription.processExpiredSubscriptions();
            logger.info("Completed scheduled processing of expired subscriptions");
        } catch (Exception e) {
            logger.error("Error during scheduled processing of expired subscriptions: {}", e.getMessage(), e);
        }
    }

    /**
     * 자동 갱신 처리 (매시간 실행)
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void processAutoRenewal() {
        logger.info("Starting scheduled processing of auto-renewal subscriptions");
        
        try {
            Subscription.processAutoRenewal();
            logger.info("Completed scheduled processing of auto-renewal subscriptions");
        } catch (Exception e) {
            logger.error("Error during scheduled processing of auto-renewal: {}", e.getMessage(), e);
        }
    }

    /**
     * 구독 상태 체크 (매 30분마다 실행)
     * - 정지된 구독 중 재시도 가능한 구독 체크
     */
    @Scheduled(fixedRate = 1800000) // 30분 (30 * 60 * 1000ms)
    public void checkSuspendedSubscriptions() {
        logger.info("Starting scheduled check of suspended subscriptions");
        
        try {
            // 정지된 구독 중 재시도 시간이 된 구독들을 자동 갱신으로 재시도
            Subscription.processAutoRenewal();
            logger.info("Completed scheduled check of suspended subscriptions");
        } catch (Exception e) {
            logger.error("Error during scheduled check of suspended subscriptions: {}", e.getMessage(), e);
        }
    }
}