package miniproject.domain.controller;

import miniproject.domain.dto.*;
import miniproject.domain.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AIController {
    
    @Autowired
    private OpenAIService openAIService;
    
    @PostMapping("/polish")
    public ResponseEntity<AIResponse> polishText(@RequestBody ContentRefineRequest request) {
        try {
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(AIResponse.error("Content is required"));
            }
            
            String polishedContent = openAIService.polishText(request.getContent(), request.getStyle());
            return ResponseEntity.ok(AIResponse.success(polishedContent));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(AIResponse.error("Error polishing text: " + e.getMessage()));
        }
    }
    
    @PostMapping("/generate-cover")
    public ResponseEntity<AIResponse> generateCover(@RequestBody CoverGenerationRequest request) {
        try {
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(AIResponse.error("Title is required"));
            }
            
            String coverUrl = openAIService.generateCoverImage(request.getTitle(), request.getGenre(), request.getDescription());
            return ResponseEntity.ok(AIResponse.success(coverUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(AIResponse.error("Error generating cover: " + e.getMessage()));
        }
    }
    
    @PostMapping("/suggest-plot")
    public ResponseEntity<AIResponse> suggestPlot(@RequestParam String genre, @RequestParam(required = false) String keywords) {
        try {
            if (genre == null || genre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(AIResponse.error("Genre is required"));
            }
            
            String plotSuggestion = openAIService.suggestPlot(genre, keywords);
            return ResponseEntity.ok(AIResponse.success(plotSuggestion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(AIResponse.error("Error suggesting plot: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<AIResponse> healthCheck() {
        return ResponseEntity.ok(AIResponse.success("AI System is running"));
    }
}
