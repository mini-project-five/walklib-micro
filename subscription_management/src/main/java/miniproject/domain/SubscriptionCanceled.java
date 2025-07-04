package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class SubscriptionCanceled extends AbstractEvent {

    private Long subscriptionId;
    private Long userId;

    public SubscriptionCanceled(Subscription aggregate) {
        super(aggregate);
        this.subscriptionId = aggregate.getSubscriptionId();
        this.userId = aggregate.getUserId();
    }

    public SubscriptionCanceled() {
        super();
    }
}
//>>> DDD / Domain Event
