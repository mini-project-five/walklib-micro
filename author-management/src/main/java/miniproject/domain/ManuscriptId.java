package miniproject.domain;

import javax.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class ManuscriptId {
    private Long manuscriptId;
}
