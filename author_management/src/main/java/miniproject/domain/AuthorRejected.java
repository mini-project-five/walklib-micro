package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class AuthorRejected extends AbstractEvent {

    private Long managementId;
    private Long userId;
    private ManagementStatus managementStatus;

    public AuthorRejected(AuthorManagement aggregate) {
        super(aggregate);
    }

    public AuthorRejected() {
        super();
    }
}
//>>> DDD / Domain Event
