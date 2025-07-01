package miniproject.domain;

import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

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

    @Override
    public Long getTimestamp() {
        return System.currentTimeMillis(); // 또는 다른 Long 타입 값
    }
}
