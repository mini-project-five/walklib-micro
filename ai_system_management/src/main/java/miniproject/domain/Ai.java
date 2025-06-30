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
import miniproject.service.OpenAIService;

@Entity
@Table(name = "Ai_table")
@Data
//<<< DDD / Aggregate Root
public class Ai {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long processId;

    private Long manuscriptId;
    
    private String title;
    
    private String content;
    
    private String status; // PROCESSING, COMPLETED, FAILED
    
    private String summary;
    
    private String coverImageUrl;

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
        System.out.println("Starting AI processing for manuscript: " + publicationRequested.getManuscriptId());
        
        // Create new AI processing record
        Ai ai = new Ai();
        ai.setManuscriptId(publicationRequested.getManuscriptId());
        ai.setTitle(publicationRequested.getTitle());
        ai.setContent(publicationRequested.getContent());
        ai.setStatus("PROCESSING");
        
        repository().save(ai);
        
        // Publish processing started event
        AiProcessingStarted aiProcessingStarted = new AiProcessingStarted(ai);
        aiProcessingStarted.publishAfterCommit();
        
        // Call OpenAI API for real AI processing
        try {
            // Get OpenAI service bean
            OpenAIService openAIService = AiSystemManagementApplication.applicationContext.getBean(OpenAIService.class);
            
            // Generate summary using ChatGPT
            String summary = openAIService.generateSummary(ai.getContent());
            ai.setSummary(summary);
            
            // Generate cover image using DALL-E
            String coverImageUrl = openAIService.generateCoverImage(ai.getTitle());
            ai.setCoverImageUrl(coverImageUrl);
            
            ai.setStatus("COMPLETED");
            repository().save(ai);
            
            // Publish completion events
            AiSummaryGenerated summaryEvent = new AiSummaryGenerated(ai);
            summaryEvent.publishAfterCommit();
            
            AiCoverImageGenerated coverEvent = new AiCoverImageGenerated(ai);
            coverEvent.publishAfterCommit();
            
            System.out.println("AI processing completed for manuscript: " + ai.getManuscriptId());
            
        } catch (Exception e) {
            ai.setStatus("FAILED");
            repository().save(ai);
            System.err.println("AI processing failed: " + e.getMessage());
        }
    }
    
    // AI processing methods moved to OpenAIService
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
