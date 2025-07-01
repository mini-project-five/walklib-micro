package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class AiSummaryGenerated extends AbstractEvent {

    private Long publicationRequestId;
    private String summary;

    public AiSummaryGenerated(Ai aggregate) {
        super(aggregate);
    }

    public AiSummaryGenerated() {
        super();
    }
}
//>>> DDD / Domain Event
