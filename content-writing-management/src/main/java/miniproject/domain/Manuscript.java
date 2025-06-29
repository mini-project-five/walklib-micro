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

    @PostPersist
    public void onPostPersist() {
        ManuscriptCreated manuscriptCreated = new ManuscriptCreated(this);
        manuscriptCreated.publishAfterCommit();

        ManuscriptUpdated manuscriptUpdated = new ManuscriptUpdated(this);
        manuscriptUpdated.publishAfterCommit();

        PublicationRequested publicationRequested = new PublicationRequested(
            this
        );
        publicationRequested.publishAfterCommit();
    }

    public static ManuscriptRepository repository() {
        ManuscriptRepository manuscriptRepository = ContentWritingManagementApplication.applicationContext.getBean(
            ManuscriptRepository.class
        );
        return manuscriptRepository;
    }
}
//>>> DDD / Aggregate Root
