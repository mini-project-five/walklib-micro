package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class ManuscriptCreated extends AbstractEvent {

    private Long manuscriptId;
    private Long authorId;
    private String title;

    public ManuscriptCreated(Manuscript aggregate) {
        super(aggregate);
    }

    public ManuscriptCreated() {
        super();
    }
}
//>>> DDD / Domain Event
