package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class AiProcessingStarted extends AbstractEvent {

    private Long publicationRequestId;

    public AiProcessingStarted(Ai aggregate) {
        super(aggregate);
    }

    public AiProcessingStarted() {
        super();
    }
}
//>>> DDD / Domain Event
