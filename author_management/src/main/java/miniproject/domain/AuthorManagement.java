package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.AuthorManagementApplication;
import miniproject.domain.AuthorApproved;
import miniproject.domain.AuthorRejected;

@Entity
@Table(name = "AuthorManagement_table")
@Data
//<<< DDD / Aggregate Root
public class AuthorManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long managementId;

    private Long userId;
    
    private Long authorId;
    
    private String authorName;
    
    private String email;

    private Long reviewerId;

    private Date reviewedAt;

    private ManagementStatus managementStatus;

    @PreUpdate
    public void onPreUpdate() {
        // Only publish events when status changes to final states
        if (this.managementStatus == ManagementStatus.APPROVED) {
            AuthorApproved authorApproved = new AuthorApproved(this);
            authorApproved.publishAfterCommit();
        } else if (this.managementStatus == ManagementStatus.REJECTED) {
            AuthorRejected authorRejected = new AuthorRejected(this);
            authorRejected.publishAfterCommit();
        }
    }

    public static AuthorManagementRepository repository() {
        AuthorManagementRepository authorManagementRepository = AuthorManagementApplication.applicationContext.getBean(
            AuthorManagementRepository.class
        );
        return authorManagementRepository;
    }

    //<<< Clean Arch / Port Method
    public static void authorManagementPolicy(
        AuthorRegisterApplied authorRegisterApplied
    ) {
        System.out.println("Processing author registration: " + authorRegisterApplied.getAuthorName());
        
        // Create new author management record
        AuthorManagement authorManagement = new AuthorManagement();
        authorManagement.setAuthorId(authorRegisterApplied.getAuthorId());
        authorManagement.setAuthorName(authorRegisterApplied.getAuthorName());
        authorManagement.setEmail(authorRegisterApplied.getEmail());
        authorManagement.setManagementStatus(ManagementStatus.PENDING);
        authorManagement.setReviewedAt(new Date());
        
        repository().save(authorManagement);
        
        // Auto-approval logic (simulate review process)
        boolean shouldApprove = autoReviewAuthor(authorRegisterApplied);
        
        if (shouldApprove) {
            authorManagement.setManagementStatus(ManagementStatus.APPROVED);
            authorManagement.setReviewerId(1L); // System reviewer
            System.out.println("Author approved: " + authorRegisterApplied.getAuthorName());
        } else {
            authorManagement.setManagementStatus(ManagementStatus.REJECTED);
            authorManagement.setReviewerId(1L);
            System.out.println("Author rejected: " + authorRegisterApplied.getAuthorName());
        }
        
        // Save once - @PreUpdate will handle event publishing based on status
        repository().save(authorManagement);
    }
    
    private static boolean autoReviewAuthor(AuthorRegisterApplied application) {
        // Simple auto-approval logic
        if (application.getEmail() == null || !application.getEmail().contains("@")) {
            return false;
        }
        if (application.getAuthorName() == null || application.getAuthorName().length() < 2) {
            return false;
        }
        // 90% approval rate simulation
        return Math.random() > 0.1;
    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
