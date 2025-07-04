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

    @Lob
    private String content; // 원고 내용

    @Lob
    private String coverImage; // 표지 이미지 URL

    private Integer viewCount;

    private Boolean isBestseller;

    private String status; // DRAFT, PUBLISHED, DELETED

    private Date createdAt;

    private Date publishedAt;

    @PostPersist
    public void onPostPersist() {
        // 생성 시간 설정
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        
        BookRegistered bookRegistered = new BookRegistered(this);
        bookRegistered.publishAfterCommit();

        DesignatedAsBestseller designatedAsBestseller = new DesignatedAsBestseller(
            this
        );
        designatedAsBestseller.publishAfterCommit();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        if (this.viewCount == null) {
            this.viewCount = 0;
        }
        if (this.isBestseller == null) {
            this.isBestseller = false;
        }
    }

    public static BookRepository repository() {
        BookRepository bookRepository = BookManagementApplication.applicationContext.getBean(
            BookRepository.class
        );
        return bookRepository;
    }
}
//>>> DDD / Aggregate Root
