package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.BookManagementApplication;
import miniproject.domain.BookRegistered;
import miniproject.domain.DesignatedAsBestseller;

@Entity
@Table(name = "Book_table")
@Data
//<<< DDD / Aggregate Root
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long bookId;

    private String title;

    private Long authorId;

    private Integer viewCount;

    private Boolean isBestseller;

    private String status;

    @PostPersist
    public void onPostPersist() {
        BookRegistered bookRegistered = new BookRegistered(this);
        bookRegistered.publishAfterCommit();

        DesignatedAsBestseller designatedAsBestseller = new DesignatedAsBestseller(
            this
        );
        designatedAsBestseller.publishAfterCommit();
    }

    public static BookRepository repository() {
        BookRepository bookRepository = BookManagementApplication.applicationContext.getBean(
            BookRepository.class
        );
        return bookRepository;
    }
}
//>>> DDD / Aggregate Root
