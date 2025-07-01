package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
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

    private String content;

    private String status;

    private String updatedAt;

    @PrePersist
    public void onPrePersist() {
        // Set initial status if not already set
        if (this.status == null) {
            this.status = "DRAFT";
        }
        if (this.updatedAt == null) {
            this.updatedAt = new Date().toString();
        }
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
        
        // Trigger publication request when status changes to COMPLETED
        if ("COMPLETED".equals(this.status)) {
            PublicationRequested publicationRequested = new PublicationRequested(this);
            publicationRequested.publishAfterCommit();
        }
    }

    //<<< Clean Arch / Port Method
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
