package miniproject.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.AuthorManagementApplication;
import miniproject.domain.AuthorRegisterApplied;

@Entity
@Table(name = "Author_table")
@Data
//<<< DDD / Aggregate Root
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonProperty("authorId")
    private Long authorId;

    private String authorName;

    private String email;

    private String introduction;

    private String authorPassword;

    private String realName;

    private AuthorRegisterStatus authorRegisterStatus; // PENDING, APPROVED, REJECTED

    @Embedded
    private ManuscriptId manuscriptId;

    @PrePersist
    public void onPrePersist() {
        // Set initial status if not already set
        if (this.authorRegisterStatus == null) {
            this.authorRegisterStatus = AuthorRegisterStatus.PENDING;
        }
    }

    @PostPersist
    public void onPostPersist() {
        AuthorRegisterApplied authorRegisterApplied = new AuthorRegisterApplied(
            this
        );
        authorRegisterApplied.publishAfterCommit();
    }

    public static AuthorRepository repository() {
        AuthorRepository authorRepository = AuthorManagementApplication.applicationContext.getBean(
            AuthorRepository.class
        );
        return authorRepository;
    }

    //<<< Clean Arch / Port Method
    public static Author authenticateAuthor(String email, String password) {
        return repository().findByEmail(email)
            .filter(author -> AuthorRegisterStatus.APPROVED.equals(author.getAuthorRegisterStatus()))
            .filter(author -> password.equals(author.getAuthorPassword()))
            .orElse(null);
    }
    //>>> Clean Arch / Port Method

    public static void authorRegisterPolicy(
        AuthorRegisterApplied authorRegisterApplied
    ){
        // This method can be used for additional processing after author registration
        System.out.println("Author register policy triggered for: " + authorRegisterApplied.getAuthorName());
    }

    //<<< Clean Arch / Port Method
    public static void authorStatusManagementPolicy(
        AuthorApproved authorApproved
    ) {
        System.out.println("Author approval policy triggered for author: " + authorApproved.getAuthorId());
        
        // Update author status to APPROVED
        Author author = repository().findById(authorApproved.getAuthorId()).orElse(null);
        if (author != null) {
            author.setAuthorRegisterStatus(AuthorRegisterStatus.APPROVED);
            repository().save(author);
            System.out.println("Author status updated to APPROVED: " + author.getAuthorName());
        }
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method  
    public static void authorRejectionManagementPolicy(
        AuthorRejected authorRejected
    ) {
        System.out.println("Author rejection policy triggered for author: " + authorRejected.getAuthorId());
        
        // Update author status to REJECTED
        Author author = repository().findById(authorRejected.getAuthorId()).orElse(null);
        if (author != null) {
            author.setAuthorRegisterStatus(AuthorRegisterStatus.REJECTED);
            repository().save(author);
            System.out.println("Author status updated to REJECTED: " + author.getAuthorName());
        }
    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
