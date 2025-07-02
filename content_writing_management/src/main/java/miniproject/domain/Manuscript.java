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

    @Lob
    private String content;

    private String status;
    
    @Lob
    private String coverImage; // 표지 이미지 URL (긴 URL 지원)
    
    private Date createdAt;
    
    private Date updatedAt;

    @PostPersist
    public void onPostPersist() {
        // 생성 시간 설정
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        this.updatedAt = new Date();
        
        ManuscriptCreated manuscriptCreated = new ManuscriptCreated(this);
        manuscriptCreated.publishAfterCommit();

        ManuscriptUpdated manuscriptUpdated = new ManuscriptUpdated(this);
        manuscriptUpdated.publishAfterCommit();

        PublicationRequested publicationRequested = new PublicationRequested(
            this
        );
        publicationRequested.publishAfterCommit();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        this.updatedAt = new Date();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = new Date();
    }

    public static ManuscriptRepository repository() {
        ManuscriptRepository manuscriptRepository = ContentWritingManagementApplication.applicationContext.getBean(
            ManuscriptRepository.class
        );
        return manuscriptRepository;
    }
}
//>>> DDD / Aggregate Root
