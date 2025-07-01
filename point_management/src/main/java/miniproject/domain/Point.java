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
    
    private String transactionType; // PURCHASE, USE, REFUND
    
    private Integer transactionAmount;
    
    private String description;

    @PostPersist
    public void onPostPersist() {
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

    public static PointRepository repository() {
        PointRepository pointRepository = PointManagementApplication.applicationContext.getBean(
            PointRepository.class
        );
        return pointRepository;
    }
    
    //<<< Clean Arch / Port Method
    public static void handleSubscriptionActivated(Long userId, Integer cost) {
        System.out.println("Processing subscription payment for user: " + userId + ", cost: " + cost);
        
        // Find user's point account
        repository().findByUserId(userId).ifPresentOrElse(
            point -> {
                if (point.getPointBalance() >= cost) {
                    // Deduct points
                    point.setPointBalance(point.getPointBalance() - cost);
                    point.setTransactionType("USE");
                    point.setTransactionAmount(cost);
                    point.setDescription("Subscription payment");
                    repository().save(point);
                    
                    PointsUsed pointsUsed = new PointsUsed(point);
                    pointsUsed.publishAfterCommit();
                    
                    System.out.println("Points deducted successfully. Remaining: " + point.getPointBalance());
                } else {
                    // Insufficient points
                    PointsInsufficient pointsInsufficient = new PointsInsufficient(point);
                    pointsInsufficient.publishAfterCommit();
                    
                    System.out.println("Insufficient points. Required: " + cost + ", Available: " + point.getPointBalance());
                }
            },
            () -> {
                // Create new point account with 0 balance
                Point newPoint = new Point();
                newPoint.setUserId(userId);
                newPoint.setPointBalance(0);
                newPoint.setTransactionType("USE");
                newPoint.setTransactionAmount(cost);
                newPoint.setDescription("Subscription payment - insufficient balance");
                repository().save(newPoint);
                
                PointsInsufficient pointsInsufficient = new PointsInsufficient(newPoint);
                pointsInsufficient.publishAfterCommit();
                
                System.out.println("New point account created with insufficient balance");
            }
        );
    }
    
    public static void purchasePoints(Long userId, Integer amount) {
        System.out.println("Purchasing points for user: " + userId + ", amount: " + amount);
        
        repository().findByUserId(userId).ifPresentOrElse(
            point -> {
                point.setPointBalance(point.getPointBalance() + amount);
                point.setTransactionType("PURCHASE");
                point.setTransactionAmount(amount);
                point.setDescription("Point purchase");
                repository().save(point);
                
                PointsPurchased pointsPurchased = new PointsPurchased(point);
                pointsPurchased.publishAfterCommit();
                
                PointsAdded pointsAdded = new PointsAdded(point);
                pointsAdded.publishAfterCommit();
                
                System.out.println("Points purchased successfully. New balance: " + point.getPointBalance());
            },
            () -> {
                Point newPoint = new Point();
                newPoint.setUserId(userId);
                newPoint.setPointBalance(amount);
                newPoint.setTransactionType("PURCHASE");
                newPoint.setTransactionAmount(amount);
                newPoint.setDescription("Initial point purchase");
                repository().save(newPoint);
                
                PointsPurchased pointsPurchased = new PointsPurchased(newPoint);
                pointsPurchased.publishAfterCommit();
                
                PointsAdded pointsAdded = new PointsAdded(newPoint);
                pointsAdded.publishAfterCommit();
                
                System.out.println("New point account created with balance: " + amount);
            }
        );
    }
    //>>> Clean Arch / Port Method
}
//>>> DDD / Aggregate Root
