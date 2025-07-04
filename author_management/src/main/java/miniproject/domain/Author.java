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
import miniproject.domain.AuthorRegisterApplied;

@Entity
@Table(name = "Author_table")
@Data
//<<< DDD / Aggregate Root
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long authorId;

    private String authorName;

    private String email;

    private String introduction;

    private String authorPassword;

    private String realName;

    private AuthorRegisterStatus authorRegisterStatus;

    @Embedded
    private ManuscriptId manuscriptId;

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
    public static void authorStatusManagementPolicy(
        AuthorApproved authorApproved
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Author author = new Author();
        repository().save(author);

        */

        /** Example 2:  finding and process
        

        repository().findById(authorApproved.get???()).ifPresent(author->{
            
            author // do something
            repository().save(author);


         });
        */

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public static void authorStatusManagementPolicy(
        AuthorRejected authorRejected
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Author author = new Author();
        repository().save(author);

        */

        /** Example 2:  finding and process
        

        repository().findById(authorRejected.get???()).ifPresent(author->{
            
            author // do something
            repository().save(author);


         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
