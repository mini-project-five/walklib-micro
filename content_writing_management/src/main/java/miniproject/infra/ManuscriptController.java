package miniproject.infra;

import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/manuscripts")
@Transactional
@CrossOrigin(origins = "*")
public class ManuscriptController {

    @Autowired
    ManuscriptRepository manuscriptRepository;

    @GetMapping
    public Iterable<Manuscript> getAll() {
        return manuscriptRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Manuscript> getById(@PathVariable("id") Long id) {
        return manuscriptRepository.findById(id);
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<Map<String, Object>> getByAuthor(@PathVariable("authorId") String authorIdStr) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Handle "undefined" case - return empty list instead of error
            if ("undefined".equals(authorIdStr) || authorIdStr == null || authorIdStr.trim().isEmpty()) {
                response.put("success", true);
                response.put("_embedded", Map.of("manuscripts", Collections.emptyList()));
                return ResponseEntity.ok(response);
            }
            
            Long authorId = Long.valueOf(authorIdStr);
            
            List<Manuscript> manuscripts = Manuscript.getManuscriptsByAuthor(authorId);
            
            response.put("success", true);
            response.put("_embedded", Map.of("manuscripts", manuscripts));
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            response.put("success", true);  // Return success with empty list instead of error
            response.put("_embedded", Map.of("manuscripts", Collections.emptyList()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createManuscript(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Null 체크 추가
            Object authorIdObj = request.get("authorId");
            
            if (authorIdObj == null) {
                response.put("success", false);
                response.put("error", "AuthorId is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Long authorId = Long.valueOf(authorIdObj.toString());
            String title = (String) request.get("title");
            String content = (String) request.get("content");
            String coverImageUrl = (String) request.get("coverImageUrl");  // 추가
            
            if (title == null || content == null) {
                response.put("success", false);
                response.put("error", "Title and content are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Manuscript manuscript = Manuscript.createManuscript(authorId, title, content, coverImageUrl);
            
            if (manuscript != null) {
                response.put("success", true);
                response.put("manuscript", manuscript);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to create manuscript");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (NumberFormatException e) {
            System.err.println("Invalid authorId format: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Invalid authorId format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Error creating manuscript: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateManuscript(
        @PathVariable("id") Long id,
        @RequestBody Map<String, Object> updates
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String title = (String) updates.get("title");
            String content = (String) updates.get("content");
            
            Manuscript manuscript = Manuscript.updateManuscript(id, title, content);
            
            if (manuscript != null) {
                response.put("success", true);
                response.put("manuscript", manuscript);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Manuscript not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error updating manuscript: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/{id}/request-publication")
    public ResponseEntity<Map<String, Object>> requestPublication(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Manuscript.requestPublication(id);
            
            Optional<Manuscript> updatedManuscript = manuscriptRepository.findById(id);
            if (updatedManuscript.isPresent()) {
                response.put("success", true);
                response.put("manuscript", updatedManuscript.get());
                response.put("message", "Publication request submitted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Manuscript not found after publication request");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error requesting publication: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getByStatus(@PathVariable("status") String status) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Manuscript> manuscripts = manuscriptRepository.findByStatus(status);
            
            response.put("success", true);
            response.put("_embedded", Map.of("manuscripts", manuscripts));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting manuscripts by status: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteManuscript(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (manuscriptRepository.existsById(id)) {
                manuscriptRepository.deleteById(id);
                response.put("success", true);
                response.put("message", "Manuscript deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Manuscript not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error deleting manuscript: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
