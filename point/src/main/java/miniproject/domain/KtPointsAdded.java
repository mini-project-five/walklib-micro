package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class KtPointsAdded extends AbstractEvent {

    private Long userId;
    private Integer amount;
    private String reason;
    private Integer currentBalance;

    public KtPointsAdded(Point aggregate) {
        super(aggregate);
    }

    public KtPointsAdded() {
        super();
    }
}
//>>> DDD / Domain Event
