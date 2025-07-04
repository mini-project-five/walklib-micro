package miniproject.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class PublicationRequested extends AbstractEvent {

    private Long eventId;
    private Date timestamp;
    private Long publicationRequestId;
    private Long manuscriptId;
    private Long authorId;
    private String title;
    private String content;

    public PublicationRequested(Manuscript aggregate) {
        super(aggregate);
    }

    public PublicationRequested() {
        super();
    }

    @Override
    public Long getTimestamp() {
        // 예시: Date를 Long으로 변환하여 리턴
        return System.currentTimeMillis();
    }
}
//>>> DDD / Domain Event
