package miniproject.domain;

import javax.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class ManuscriptId {
    private Long value;
    
    public ManuscriptId() {}
    
    public ManuscriptId(Long value) {
        this.value = value;
    }
}