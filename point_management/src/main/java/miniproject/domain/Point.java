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
import miniproject.infra.GlobalExceptionHandler.InsufficientPointsException;
import miniproject.infra.GlobalExceptionHandler.PointAccountNotFoundException;

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
        // 거래 유형에 따라 적절한 이벤트만 발행
        if ("PURCHASE".equals(this.transactionType)) {
            PointsPurchased pointsPurchased = new PointsPurchased(this);
            pointsPurchased.publishAfterCommit();
            
            PointsAdded pointsAdded = new PointsAdded(this);
            pointsAdded.publishAfterCommit();
        } else if ("USE".equals(this.transactionType)) {
            PointsUsed pointsUsed = new PointsUsed(this);
            pointsUsed.publishAfterCommit();
        } else if ("REFUND".equals(this.transactionType)) {
            PointsAdded pointsAdded = new PointsAdded(this);
            pointsAdded.publishAfterCommit();
        }
    }

    public static PointRepository repository() {
        PointRepository pointRepository = PointManagementApplication.applicationContext.getBean(
            PointRepository.class
        );
        return pointRepository;
    }
    
    //<<< Clean Arch / Port Method
    public static void handleSubscriptionActivated(Long userId, Integer cost) {
        // 입력 검증
        validateUserId(userId);
        validateAmount(cost, "Subscription cost");
        
        System.out.println("Processing subscription payment for user: " + userId + ", cost: " + cost);
        
        // Find user's point account
        repository().findByUserId(userId).ifPresentOrElse(
            point -> {
                if (point.canAfford(cost)) {
                    // Deduct points
                    point.deductPoints(cost, "Subscription payment");
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
                Point newPoint = createNewPointAccount(userId, 0, "USE", cost, "Subscription payment - insufficient balance");
                
                PointsInsufficient pointsInsufficient = new PointsInsufficient(newPoint);
                pointsInsufficient.publishAfterCommit();
                
                System.out.println("New point account created with insufficient balance");
            }
        );
    }
    
    public static void purchasePoints(Long userId, Integer amount) {
        // 입력 검증
        validateUserId(userId);
        validatePurchaseAmount(amount);
        
        System.out.println("Purchasing points for user: " + userId + ", amount: " + amount);
        
        repository().findByUserId(userId).ifPresentOrElse(
            point -> {
                point.addPoints(amount, "Point purchase");
                repository().save(point);
                
                PointsPurchased pointsPurchased = new PointsPurchased(point);
                pointsPurchased.publishAfterCommit();
                
                PointsAdded pointsAdded = new PointsAdded(point);
                pointsAdded.publishAfterCommit();
                
                System.out.println("Points purchased successfully. New balance: " + point.getPointBalance());
            },
            () -> {
                Point newPoint = createNewPointAccount(userId, amount, "PURCHASE", amount, "Initial point purchase");
                
                PointsPurchased pointsPurchased = new PointsPurchased(newPoint);
                pointsPurchased.publishAfterCommit();
                
                PointsAdded pointsAdded = new PointsAdded(newPoint);
                pointsAdded.publishAfterCommit();
                
                System.out.println("New point account created with balance: " + amount);
            }
        );
    }

    // 비즈니스 로직 메서드들
    public boolean canAfford(Integer amount) {
        if (amount == null || amount <= 0) {
            return false;
        }
        return this.pointBalance != null && this.pointBalance >= amount;
    }

    public void addPoints(Integer amount, String description) {
        validateAmount(amount, "Points to add");
        
        if (this.pointBalance == null) {
            this.pointBalance = 0;
        }
        
        // 최대 잔액 체크 (1,000,000 포인트)
        if (this.pointBalance + amount > 1_000_000) {
            throw new IllegalArgumentException("Maximum point balance (1,000,000) would be exceeded");
        }
        
        this.pointBalance += amount;
        this.transactionType = "PURCHASE";
        this.transactionAmount = amount;
        this.description = description;
    }

    public void deductPoints(Integer amount, String description) {
        validateAmount(amount, "Points to deduct");
        
        if (!canAfford(amount)) {
            throw new InsufficientPointsException(
                "포인트가 부족합니다. 필요: " + amount + ", 보유: " + this.pointBalance,
                amount,
                this.pointBalance
            );
        }
        
        this.pointBalance -= amount;
        this.transactionType = "USE";
        this.transactionAmount = amount;
        this.description = description;
    }

    public void refundPoints(Integer amount, String reason) {
        validateAmount(amount, "Points to refund");
        
        if (this.pointBalance == null) {
            this.pointBalance = 0;
        }
        
        // 최대 잔액 체크
        if (this.pointBalance + amount > 1_000_000) {
            throw new IllegalArgumentException("Maximum point balance (1,000,000) would be exceeded");
        }
        
        this.pointBalance += amount;
        this.transactionType = "REFUND";
        this.transactionAmount = amount;
        this.description = reason;
    }

    // 검증 메서드들
    private static void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("User ID must be a positive number");
        }
    }

    private static void validateAmount(Integer amount, String fieldName) {
        if (amount == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
        if (amount <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    private static void validatePurchaseAmount(Integer amount) {
        validateAmount(amount, "Purchase amount");
        
        // 최소 구매 금액: 10 포인트
        if (amount < 10) {
            throw new IllegalArgumentException("Minimum purchase amount is 10 points");
        }
        
        // 최대 구매 금액: 100,000 포인트
        if (amount > 100_000) {
            throw new IllegalArgumentException("Maximum purchase amount is 100,000 points");
        }
    }

    // 헬퍼 메서드
    private static Point createNewPointAccount(Long userId, Integer balance, String transactionType, Integer transactionAmount, String description) {
        Point newPoint = new Point();
        newPoint.setUserId(userId);
        newPoint.setPointBalance(balance);
        newPoint.setTransactionType(transactionType);
        newPoint.setTransactionAmount(transactionAmount);
        newPoint.setDescription(description);
        repository().save(newPoint);
        return newPoint;
    }
    //>>> Clean Arch / Port Method
}
//>>> DDD / Aggregate Root
