package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.ContentWritingManagementApplication;
import miniproject.domain.ManuscriptCreated;
import miniproject.domain.ManuscriptUpdated;
import miniproject.domain.PublicationRequested;

@Entity
@Table(name = "Manuscript_table")
@Data
//<<< DDD / Aggregate Root
public class Manuscript {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long manuscriptId;

    private Long authorId;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String status;

    private String updatedAt;

    private int views;
    
    @Column(name = "cover_image_url", length = 1000)
    private String coverImageUrl;

    @PrePersist
    public void onPrePersist() {
        // Set initial status if not already set
        if (this.status == null) {
            this.status = "DRAFT";
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        }
        // views는 int 타입이므로 기본값이 0입니다
    }

    @PostPersist
    public void onPostPersist() {
        ManuscriptCreated manuscriptCreated = new ManuscriptCreated(this);
        manuscriptCreated.publishAfterCommit();
    }

    @PostUpdate
    public void onPostUpdate() {
        ManuscriptUpdated manuscriptUpdated = new ManuscriptUpdated(this);
        manuscriptUpdated.publishAfterCommit();
        
        // Trigger publication request when status changes to PENDING_PUBLICATION
        if ("PENDING_PUBLICATION".equals(this.status)) {
            PublicationRequested publicationRequested = new PublicationRequested(this);
            publicationRequested.publishAfterCommit();
            System.out.println("Publication requested for manuscript: " + this.title);
        }
    }

    //<<< Clean Arch / Port Method
    public static Manuscript createManuscript(Long authorId, String title, String content, String coverImageUrl) {
        System.out.println("Creating new manuscript: " + title + " by author: " + authorId);
        
        Manuscript manuscript = new Manuscript();
        manuscript.setAuthorId(authorId);
        manuscript.setTitle(title);
        manuscript.setContent(content);
        manuscript.setCoverImageUrl(coverImageUrl);
        manuscript.setStatus("DRAFT");
        manuscript.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        return repository().save(manuscript);
    }
    
    // 기존 호환성을 위한 오버로드 메소드
    public static Manuscript createManuscript(Long authorId, String title, String content) {
        return createManuscript(authorId, title, content, null);
    }
    
    public static Manuscript updateManuscript(Long manuscriptId, String title, String content) {
        System.out.println("Updating manuscript: " + manuscriptId);
        
        return repository().findById(manuscriptId)
            .map(manuscript -> {
                if (title != null) manuscript.setTitle(title);
                if (content != null) manuscript.setContent(content);
                manuscript.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
                
                return repository().save(manuscript);
            })
            .orElse(null);
    }
    
    public static void requestPublication(Long manuscriptId) {
        System.out.println("Requesting publication for manuscript: " + manuscriptId);
        
        repository().findById(manuscriptId).ifPresent(manuscript -> {
            manuscript.setStatus("PENDING_PUBLICATION");
            manuscript.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            repository().save(manuscript);
        });
    }
    
    public static List<Manuscript> getManuscriptsByAuthor(Long authorId) {
        System.out.println("📚 Finding manuscripts for authorId: " + authorId);
        List<Manuscript> manuscripts = repository().findByAuthorId(authorId);
        System.out.println("📚 Found " + manuscripts.size() + " manuscripts");
        return manuscripts;
    }

    public static void manuscriptCreatedPolicy(ManuscriptCreated manuscriptCreated){
        System.out.println("Manuscript created policy triggered for: " + manuscriptCreated.getTitle());
        // Additional processing logic can be added here
        // For example, indexing for search, notification to editors, etc.
    }

    public static void manuscriptUpdatedPolicy(ManuscriptUpdated manuscriptUpdated){
        System.out.println("Manuscript updated policy triggered for: " + manuscriptUpdated.getTitle());
        // Additional processing logic can be added here
        // For example, version tracking, backup creation, etc.
    }

    public static void publicationRequestPolicy(PublicationRequested publicationRequested){
        System.out.println("Publication request policy triggered for manuscript: " + publicationRequested.getTitle());
        // Additional processing logic can be added here
        // For example, quality checks, editorial review assignment, etc.
    }
    //>>> Clean Arch / Port Method

    public static ManuscriptRepository repository() {
        ManuscriptRepository manuscriptRepository = ContentWritingManagementApplication.applicationContext.getBean(
            ManuscriptRepository.class
        );
        return manuscriptRepository;
    }
}
//>>> DDD / Aggregate Root
