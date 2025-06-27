package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class AiCoverImageGenerated extends AbstractEvent {

    private Long publicationRequestId;
    private String coverImageUrl;

    public AiCoverImageGenerated(Ai aggregate) {
        super(aggregate);
    }

    public AiCoverImageGenerated() {
        super();
    }
}
//>>> DDD / Domain Event
