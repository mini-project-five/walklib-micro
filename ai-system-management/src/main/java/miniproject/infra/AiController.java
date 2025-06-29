package miniproject.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import miniproject.dto.*;
import miniproject.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/ais")
@Transactional
public class AiController {

    @Autowired
    AiRepository aiRepository;
    
    @Autowired
    private OpenAIService openAIService;
    
    @GetMapping("/health")
    public String healthCheck() {
        return "AI System Management is running";
    }
    
    @PostMapping("")
    public Ai processAiRequest(@RequestBody Ai ai) {
        return aiRepository.save(ai);
    }
    
    @GetMapping("")
    public Iterable<Ai> getAllAiProcesses() {
        return aiRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public Ai getAiProcess(@PathVariable Long id) {
        return aiRepository.findById(id).orElse(null);
    }
    
    // 텍스트 다듬기 API
    @PostMapping("/refine-text")
    public ResponseEntity<AIResponse> refineText(@RequestBody TextRefinementRequest request) {
        try {
            if (request.getOriginalText() == null || request.getOriginalText().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(AIResponse.error("원본 텍스트는 필수입니다.", "MISSING_TEXT"));
            }
            
            String refinedText = openAIService.refineText(
                request.getOriginalText(),
                request.getGenre(),
                request.getStyle(),
                request.getTargetAudience(),
                request.getInstructions()
            );
            
            return ResponseEntity.ok(AIResponse.success(refinedText));
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(AIResponse.error("텍스트 다듬기 중 오류가 발생했습니다: " + e.getMessage(), "REFINEMENT_ERROR"));
        }
    }
    
    // 표지 이미지 생성 API
    @PostMapping("/generate-cover")
    public ResponseEntity<AIResponse> generateCover(@RequestBody CoverGenerationRequest request) {
        try {
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(AIResponse.error("책 제목은 필수입니다.", "MISSING_TITLE"));
            }
            
            String imageUrl = openAIService.generateCoverImage(
                request.getTitle(),
                request.getAuthor(),
                request.getGenre(),
                request.getMood(),
                request.getStyle(),
                request.getColorScheme(),
                request.getDescription()
            );
            
            return ResponseEntity.ok(AIResponse.success(imageUrl));
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(AIResponse.error("표지 이미지 생성 중 오류가 발생했습니다: " + e.getMessage(), "GENERATION_ERROR"));
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
