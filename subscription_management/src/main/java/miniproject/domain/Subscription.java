package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.SubscriptionManagementApplication;
import miniproject.domain.SubscriptionActivated;
import miniproject.domain.SubscriptionCanceled;

@Entity
@Table(name = "Subscription_table")
@Data
//<<< DDD / Aggregate Root
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long subscriptionId;

    private Long userId;

    private String status; // ACTIVE, CANCELED, EXPIRED
    
    private String planType; // BASIC, PREMIUM
    
    private Integer monthlyCost;

    private Date startDate;

    private Date endDate;

    @PostPersist
    public void onPostPersist() {
        SubscriptionActivated subscriptionActivated = new SubscriptionActivated(
            this
        );
        subscriptionActivated.publishAfterCommit();

        SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(
            this
        );
        subscriptionCanceled.publishAfterCommit();
    }

    public static SubscriptionRepository repository() {
        SubscriptionRepository subscriptionRepository = SubscriptionManagementApplication.applicationContext.getBean(
            SubscriptionRepository.class
        );
        return subscriptionRepository;
    }
    
    //<<< Clean Arch / Port Method
    public static void activateSubscription(Long userId, String planType) {
        System.out.println("Activating subscription for user: " + userId + ", plan: " + planType);
        
        // Check if user already has active subscription
        repository().findByUserIdAndStatus(userId, "ACTIVE").ifPresentOrElse(
            subscription -> {
                System.out.println("User already has active subscription: " + subscription.getSubscriptionId());
            },
            () -> {
                // Create new subscription
                Subscription subscription = new Subscription();
                subscription.setUserId(userId);
                subscription.setPlanType(planType);
                subscription.setStatus("ACTIVE");
                subscription.setStartDate(new Date());
                
                // Set end date (1 month later) and cost based on plan
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.setTime(new Date());
                cal.add(java.util.Calendar.MONTH, 1);
                subscription.setEndDate(cal.getTime());
                
                if ("PREMIUM".equals(planType)) {
                    subscription.setMonthlyCost(29900); // 29,900 points
                } else {
                    subscription.setMonthlyCost(9900); // 9,900 points
                }
                
                repository().save(subscription);
                
                SubscriptionActivated subscriptionActivated = new SubscriptionActivated(subscription);
                subscriptionActivated.publishAfterCommit();
                
                System.out.println("Subscription activated successfully: " + subscription.getSubscriptionId());
            }
        );
    }
    
    public static void cancelSubscription(Long userId) {
        System.out.println("Canceling subscription for user: " + userId);
        
        repository().findByUserIdAndStatus(userId, "ACTIVE").ifPresentOrElse(
            subscription -> {
                subscription.setStatus("CANCELED");
                subscription.setEndDate(new Date()); // End immediately
                repository().save(subscription);
                
                SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(subscription);
                subscriptionCanceled.publishAfterCommit();
                
                System.out.println("Subscription canceled: " + subscription.getSubscriptionId());
            },
            () -> {
                System.out.println("No active subscription found for user: " + userId);
            }
        );
    }
    
    public static void handlePointsInsufficient(Long userId) {
        System.out.println("Handling insufficient points for user: " + userId);
        
        // Cancel subscription due to insufficient points
        repository().findByUserIdAndStatus(userId, "ACTIVE").ifPresent(subscription -> {
            subscription.setStatus("CANCELED");
            subscription.setEndDate(new Date());
            repository().save(subscription);
            
            SubscriptionCanceled subscriptionCanceled = new SubscriptionCanceled(subscription);
            subscriptionCanceled.publishAfterCommit();
            
            System.out.println("Subscription canceled due to insufficient points: " + subscription.getSubscriptionId());
        });
    }
    //>>> Clean Arch / Port Method
}
//>>> DDD / Aggregate Root
