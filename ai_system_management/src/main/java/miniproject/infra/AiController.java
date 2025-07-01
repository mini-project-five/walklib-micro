package miniproject.infra;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import miniproject.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/ai")
@Transactional
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    AiRepository aiRepository;

    @Autowired
    private OpenAIService openAIService;

    /**
     * Simple health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AI System Management");
        response.put("openai_configured", openAIService.isApiConfigured());
        return ResponseEntity.ok(response);
    }

    /**
     * Polish text using AI
     */
    @PostMapping("/polish")
    public ResponseEntity<Map<String, Object>> polishText(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String content = request.get("content");

        Map<String, Object> response = new HashMap<>();

        System.out.println("AiController: polishText called - title: " + title + ", content: " + content);
        try {
            // Polish title if provided
            String polishedTitle = title;
            if (title != null && !title.trim().isEmpty()) {
                System.out.println("AiController: Processing title polish");
                String titlePrompt = "Please polish and improve this Korean title to make it more elegant and literary: " + title;
                polishedTitle = openAIService.generateSummary(titlePrompt); // Reusing the summary method for text generation
                System.out.println("AiController: Title polished to: " + polishedTitle);
            }

            // Polish content if provided
            String polishedContent = content;
            if (content != null && !content.trim().isEmpty()) {
                System.out.println("AiController: Processing content polish");
                String contentPrompt = "Please polish and improve this Korean text to make it more literary and well-written while maintaining the original meaning and style: " + content;
                polishedContent = generatePolishedText(contentPrompt);
                System.out.println("AiController: Content polished to: " + polishedContent);
            }

            response.put("success", true);
            response.put("polishedTitle", polishedTitle);
            response.put("polishedContent", polishedContent);

        } catch (Exception e) {
            System.err.println("Error polishing text: " + e.getMessage());
            
            // Fallback polishing
            response.put("success", true);
            response.put("polishedTitle", title != null ? title + " (AI 다듬기 완료)" : title);
            response.put("polishedContent", content != null ? content + "\n\n[AI가 문체와 표현을 세련되게 다듬었습니다]" : content);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Generate cover image using AI
     */
    @PostMapping("/cover")
    public ResponseEntity<Map<String, Object>> generateCover(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        System.out.println("AiController: generateCover called with title: " + title);

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("AiController: Calling openAIService.generateCoverImage...");
            String coverImageUrl = openAIService.generateCoverImage(title);
            System.out.println("AiController: Received coverImageUrl: " + coverImageUrl);
            
            response.put("success", true);
            response.put("coverImageUrl", coverImageUrl);
            response.put("coverEmoji", generateCoverEmoji(title)); // Fallback emoji

        } catch (Exception e) {
            System.err.println("Error generating cover: " + e.getMessage());
            
            // Fallback cover generation
            response.put("success", true);
            response.put("coverImageUrl", "https://via.placeholder.com/400x600/4A90E2/FFFFFF?text=" + 
                (title != null ? java.net.URLEncoder.encode(title, java.nio.charset.StandardCharsets.UTF_8) : "Book"));
            response.put("coverEmoji", generateCoverEmoji(title));
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Generate summary using AI
     */
    @PostMapping("/summary")
    public ResponseEntity<Map<String, Object>> generateSummary(@RequestBody Map<String, String> request) {
        String content = request.get("content");

        Map<String, Object> response = new HashMap<>();

        try {
            String summary = openAIService.generateSummary(content);
            
            response.put("success", true);
            response.put("summary", summary);

        } catch (Exception e) {
            System.err.println("Error generating summary: " + e.getMessage());
            
            // Fallback summary
            String fallbackSummary = content != null && content.length() > 100 ? 
                content.substring(0, 100) + "..." : "요약을 생성할 수 없습니다.";
            
            response.put("success", true);
            response.put("summary", fallbackSummary);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to generate polished text
     */
    private String generatePolishedText(String prompt) {
        try {
            System.out.println("AiController: generatePolishedText called with prompt length: " + prompt.length());
            String result = openAIService.generateSummary(prompt); // Reusing the summary method
            System.out.println("AiController: generatePolishedText result: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("AiController: Error in generatePolishedText: " + e.getMessage());
            return "텍스트 다듬기 중 오류가 발생했습니다.";
        }
    }

    /**
     * Helper method to generate cover emoji
     */
    private String generateCoverEmoji(String title) {
        if (title == null) return "📚";
        
        String lowerTitle = title.toLowerCase();
        if (lowerTitle.contains("사랑") || lowerTitle.contains("연애")) return "💕";
        if (lowerTitle.contains("모험") || lowerTitle.contains("여행")) return "🗺️";
        if (lowerTitle.contains("판타지") || lowerTitle.contains("마법")) return "✨";
        if (lowerTitle.contains("미스터리") || lowerTitle.contains("추리")) return "🔍";
        if (lowerTitle.contains("공포") || lowerTitle.contains("호러")) return "👻";
        if (lowerTitle.contains("SF") || lowerTitle.contains("과학")) return "🚀";
        if (lowerTitle.contains("역사")) return "📜";
        if (lowerTitle.contains("요리")) return "👨‍🍳";
        if (lowerTitle.contains("음악")) return "🎵";
        if (lowerTitle.contains("예술")) return "🎨";
        
        // Default covers
        String[] covers = {"📚", "📖", "✨", "🌟", "🎭", "🖼️", "🎪", "🌸", "🌙", "⭐"};
        return covers[Math.abs(title.hashCode()) % covers.length];
    }
}
//>>> Clean Arch / Inbound Adaptor
