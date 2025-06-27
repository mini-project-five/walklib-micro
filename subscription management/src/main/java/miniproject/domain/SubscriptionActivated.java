package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class SubscriptionActivated extends AbstractEvent {

    private Long subscriptionId;
    private Long userId;
    private String plan;
    private String endDate;

    public SubscriptionActivated(Subscription aggregate) {
        super(aggregate);
    }

    public SubscriptionActivated() {
        super();
    }
}
//>>> DDD / Domain Event
