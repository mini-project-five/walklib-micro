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
    
    @Column(columnDefinition = "LONGTEXT")
    private String content;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(length = 1000)
    private String coverImageUrl;
    
    private Long manuscriptId;

    private Long authorId;

    private Integer viewCount;

    private Integer totalRating = 0;

    private Integer ratingCount = 0;

    private Boolean isBestseller;

    private String status; // DRAFT, PUBLISHED, BESTSELLER

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
    
    //<<< Clean Arch / Port Method
    public static void handleAiProcessingCompleted(Long manuscriptId, String title, String content, String summary, String coverImageUrl, Long authorId) {
        System.out.println("Creating book from AI processed manuscript: " + manuscriptId);
        
        // Check if book already exists for this manuscript
        repository().findByManuscriptId(manuscriptId).ifPresentOrElse(
            book -> {
                // Update existing book
                book.setSummary(summary);
                book.setCoverImageUrl(coverImageUrl);
                book.setStatus("PUBLISHED");
                repository().save(book);
                
                BookRegistered bookRegistered = new BookRegistered(book);
                bookRegistered.publishAfterCommit();
                
                System.out.println("Book updated and published: " + book.getTitle());
            },
            () -> {
                // Create new book
                Book book = new Book();
                book.setManuscriptId(manuscriptId);
                book.setTitle(title);
                book.setContent(content);
                book.setSummary(summary);
                book.setCoverImageUrl(coverImageUrl);
                book.setAuthorId(authorId);
                book.setViewCount(0);
                book.setIsBestseller(false);
                book.setStatus("PUBLISHED");
                
                repository().save(book);
                
                BookRegistered bookRegistered = new BookRegistered(book);
                bookRegistered.publishAfterCommit();
                
                System.out.println("New book created and published: " + book.getTitle());
            }
        );
    }
    
    public static void checkBestsellerStatus(Long bookId) {
        repository().findById(bookId).ifPresent(book -> {
            // Simple bestseller logic: if viewCount > 1000
            if (book.getViewCount() != null && book.getViewCount() > 1000 && !book.getIsBestseller()) {
                book.setIsBestseller(true);
                book.setStatus("BESTSELLER");
                repository().save(book);
                
                DesignatedAsBestseller designatedAsBestseller = new DesignatedAsBestseller(book);
                designatedAsBestseller.publishAfterCommit();
                
                System.out.println("Book designated as bestseller: " + book.getTitle());
            }
        });
    }
    
    public static void incrementViewCount(Long bookId) {
        repository().findById(bookId).ifPresent(book -> {
            book.setViewCount((book.getViewCount() != null ? book.getViewCount() : 0) + 1);
            repository().save(book);
            
            // Check if it should become bestseller
            checkBestsellerStatus(bookId);
        });
    }

    public Integer getTotalRating() {
        return totalRating != null ? totalRating : 0;
    }

    public void setTotalRating(Integer totalRating) {
        this.totalRating = totalRating;
    }

    public Integer getRatingCount() {
        return ratingCount != null ? ratingCount : 0;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public Double getAverageRating() {
        if (ratingCount == null || ratingCount == 0) {
            return 0.0;
        }
        return Math.round((double) getTotalRating() / getRatingCount() * 10.0) / 10.0;
    }
    //>>> Clean Arch / Port Method
}
//>>> DDD / Aggregate Root
