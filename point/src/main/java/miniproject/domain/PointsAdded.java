package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class PointsAdded extends AbstractEvent {

    private Long userId;
    private Integer amount;
    private String reason;
    private Integer currentBalance;

    public PointsAdded(Point aggregate) {
        super(aggregate);
    }

    public PointsAdded() {
        super();
    }
}
//>>> DDD / Domain Event
