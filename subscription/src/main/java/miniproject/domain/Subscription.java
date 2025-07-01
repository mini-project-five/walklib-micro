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

    private String status;

    private Date startDate;

    private Date endDate;

    @PostPersist
    public void onPostPersist() {
        SubscriptionActivated subscriptionActivated = new SubscriptionActivated(
            this
        );
        subscriptionActivated.publishAfterCommit();

        SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(
            this
        );
        subscriptionCanceled.publishAfterCommit();
    }

    public static SubscriptionRepository repository() {
        SubscriptionRepository subscriptionRepository = SubscriptionManagementApplication.applicationContext.getBean(
            SubscriptionRepository.class
        );
        return subscriptionRepository;
    }
}
//>>> DDD / Aggregate Root
