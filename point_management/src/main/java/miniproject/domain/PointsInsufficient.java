package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class PointsInsufficient extends AbstractEvent {

    private Long userId;
    private Integer requiredAmount;
    private Integer currentBalance;

    public PointsInsufficient(Point aggregate) {
        super(aggregate);
    }

    public PointsInsufficient() {
        super();
    }
}
//>>> DDD / Domain Event
