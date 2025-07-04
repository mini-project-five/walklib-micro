package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.SubscriptionManagementApplication;
import miniproject.domain.SubscriptionActivated;
import miniproject.domain.SubscriptionCanceled;

@Entity
@Table(name = "Subscription_table")
@Data
//<<< DDD / Aggregate Root
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long subscriptionId;

    private Long userId;

    private String status; // "ACTIVE", "INACTIVE", "EXPIRED"
    
    private String planType; // "PREMIUM" (월 9,900원)
    
    private Integer monthlyFee; // 월 요금
    
    private Date startDate;

    private Date endDate;
    
    private Date createdAt;

    @PostPersist
    public void onPostPersist() {
        // 생성 시간 설정
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        
        SubscriptionActivated subscriptionActivated = new SubscriptionActivated(
            this
        );
        subscriptionActivated.publishAfterCommit();

        SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(
            this
        );
        subscriptionCanceled.publishAfterCommit();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
    }
    
    // 구독이 활성화되어 있는지 확인
    public boolean isActive() {
        if (!"ACTIVE".equals(this.status)) {
            return false;
        }
        Date now = new Date();
        return now.before(this.endDate);
    }

    public static SubscriptionRepository repository() {
        SubscriptionRepository subscriptionRepository = SubscriptionManagementApplication.applicationContext.getBean(
            SubscriptionRepository.class
        );
        return subscriptionRepository;
    }
}
//>>> DDD / Aggregate Root
