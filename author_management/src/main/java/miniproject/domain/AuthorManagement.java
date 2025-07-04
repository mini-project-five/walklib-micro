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

    private Long reviewerId;

    private Date reviewedAt;

    private ManagementStatus managementStatus;

    @PreUpdate
    public void onPreUpdate() {
        AuthorApproved authorApproved = new AuthorApproved(this);
        authorApproved.publishAfterCommit();

        AuthorRejected authorRejected = new AuthorRejected(this);
        authorRejected.publishAfterCommit();
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
        //implement business logic here:

        /** Example 1:  new item 
        AuthorManagement authorManagement = new AuthorManagement();
        repository().save(authorManagement);

        */

        /** Example 2:  finding and process
        
        // if authorRegisterApplied.manuscriptId exists, use it
        
        // ObjectMapper mapper = new ObjectMapper();
        // Map<Long, Object> authorMap = mapper.convertValue(authorRegisterApplied.getManuscriptId(), Map.class);

        repository().findById(authorRegisterApplied.get???()).ifPresent(authorManagement->{
            
            authorManagement // do something
            repository().save(authorManagement);


         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
