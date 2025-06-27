package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class PointsPurchased extends AbstractEvent {

    private Long userId;
    private Integer amount;
    private String paymentId;
    private Integer currentBalance;

    public PointsPurchased(Point aggregate) {
        super(aggregate);
    }

    public PointsPurchased() {
        super();
    }
}
//>>> DDD / Domain Event
