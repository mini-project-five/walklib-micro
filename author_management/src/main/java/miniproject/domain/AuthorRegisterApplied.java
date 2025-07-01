package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class AuthorRegisterApplied extends AbstractEvent {

    private Long authorId;
    private String authorName;
    private Date approvedAt;
    private String email;

    public AuthorRegisterApplied(Author aggregate) {
        super(aggregate);
    }

    public AuthorRegisterApplied() {
        super();
    }
}
//>>> DDD / Domain Event
