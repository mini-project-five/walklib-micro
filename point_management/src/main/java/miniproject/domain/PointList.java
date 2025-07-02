package miniproject.domain;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import javax.persistence.*;
import lombok.Data;

//<<< EDA / CQRS
@Entity
@Table(name = "PointList_table")
@Data
public class PointList {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long userId;
    private Integer currentBalance;
    private Date transactionDate;
    private Integer amount;
    private String reason;
    private String transactionType; // PURCHASE, USE, REFUND
}
