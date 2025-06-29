package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.AiSystemManagementApplication;
import miniproject.domain.AiCoverImageGenerated;
import miniproject.domain.AiProcessingStarted;
import miniproject.domain.AiSummaryGenerated;

@Entity
@Table(name = "Ai_table")
@Data
//<<< DDD / Aggregate Root
public class Ai {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long processId;

    @PostPersist
    public void onPostPersist() {
        AiCoverImageGenerated aiCoverImageGenerated = new AiCoverImageGenerated(
            this
        );
        aiCoverImageGenerated.publishAfterCommit();

        AiSummaryGenerated aiSummaryGenerated = new AiSummaryGenerated(this);
        aiSummaryGenerated.publishAfterCommit();

        AiProcessingStarted aiProcessingStarted = new AiProcessingStarted(this);
        aiProcessingStarted.publishAfterCommit();
    }

    public static AiRepository repository() {
        AiRepository aiRepository = AiSystemManagementApplication.applicationContext.getBean(
            AiRepository.class
        );
        return aiRepository;
    }

    //<<< Clean Arch / Port Method
    public static void publicationProcessingPolicy(
        PublicationRequested publicationRequested
    ) {
        //implement business logic here:

        /** Example 1:  new item 
        Ai ai = new Ai();
        repository().save(ai);

        AiProcessingStarted aiProcessingStarted = new AiProcessingStarted(ai);
        aiProcessingStarted.publishAfterCommit();
        */

        /** Example 2:  finding and process
        

        repository().findById(publicationRequested.get???()).ifPresent(ai->{
            
            ai // do something
            repository().save(ai);

            AiProcessingStarted aiProcessingStarted = new AiProcessingStarted(ai);
            aiProcessingStarted.publishAfterCommit();

         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
