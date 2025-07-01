package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class PointsUsed extends AbstractEvent {

    private Long userId;
    private Integer amount;
    private Long bookId;
    private Integer currentBalance;

    public PointsUsed(Point aggregate) {
        super(aggregate);
    }

    public PointsUsed() {
        super();
    }
}
//>>> DDD / Domain Event
