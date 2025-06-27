package miniproject.domain;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import javax.persistence.*;
import lombok.Data;

//<<< EDA / CQRS
@Entity
@Table(name = "AuthorManagementView_table")
@Data
public class AuthorManagementView {

    @Id
    //@GeneratedValue(strategy=GenerationType.AUTO)
    private Long managementId;

    private Long userId;
    private Long reviewerId;
    private Date reviewedAt;
    private Date managementStatus;
}
