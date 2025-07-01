package miniproject.domain;

import java.util.*;
import lombok.*;
import miniproject.domain.*;
import miniproject.infra.AbstractEvent;

@Data
@ToString
public class PublicationRequested extends AbstractEvent {

    private Long eventId;
    private Long publicationRequestId; // 요청 ID (Ai 엔티티의 processId와 매핑)
    private Long manuscriptId;
    private Long authorId;
    private String title; // 추가 또는 확인
    private String content; // 추가 또는 확인
}