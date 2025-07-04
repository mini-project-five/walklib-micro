package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.PointManagementApplication;
import miniproject.domain.KtPointsAdded;
import miniproject.domain.PointsAdded;
import miniproject.domain.PointsInsufficient;
import miniproject.domain.PointsPurchased;
import miniproject.domain.PointsUsed;

@Entity
@Table(name = "Point_table")
@Data
//<<< DDD / Aggregate Root
public class Point {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long pointId;

    private Long userId;

    private Integer pointBalance;
    
    private String pointType; // "SIGNUP", "KT_BONUS", "PURCHASE", "USAGE"
    
    private Integer amount; // 증감 포인트
    
    private String description; // 포인트 변경 사유
    
    private Date createdAt;

    @PostPersist
    public void onPostPersist() {
        // 생성 시간 설정
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        
        PointsAdded pointsAdded = new PointsAdded(this);
        pointsAdded.publishAfterCommit();

        PointsPurchased pointsPurchased = new PointsPurchased(this);
        pointsPurchased.publishAfterCommit();

        PointsUsed pointsUsed = new PointsUsed(this);
        pointsUsed.publishAfterCommit();

        PointsInsufficient pointsInsufficient = new PointsInsufficient(this);
        pointsInsufficient.publishAfterCommit();

        KtPointsAdded ktPointsAdded = new KtPointsAdded(this);
        ktPointsAdded.publishAfterCommit();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
    }

    public static PointRepository repository() {
        PointRepository pointRepository = PointManagementApplication.applicationContext.getBean(
            PointRepository.class
        );
        return pointRepository;
    }
}
//>>> DDD / Aggregate Root
