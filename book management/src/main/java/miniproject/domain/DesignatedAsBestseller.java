package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class DesignatedAsBestseller extends AbstractEvent {

    private Long bookId;
    private String bookId;

    public DesignatedAsBestseller(Book aggregate) {
        super(aggregate);
    }

    public DesignatedAsBestseller() {
        super();
    }
}
//>>> DDD / Domain Event
