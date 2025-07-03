package miniproject.infra;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import miniproject.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 공개 Author API (인증 불필요)
 */
@RestController
@RequestMapping(value="/public")
public class PublicAuthorController {

    private static final Logger logger = LoggerFactory.getLogger(PublicAuthorController.class);

    @Autowired
    AuthorRepository authorRepository;

    /**
     * 공개 작가 이름 조회
     */
    @GetMapping("/authors/{id}/name")
    public ResponseEntity<Map<String, Object>> getAuthorName(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Author> authorOpt = authorRepository.findById(id);
            if (authorOpt.isPresent()) {
                Author author = authorOpt.get();
                
                response.put("success", true);
                response.put("authorId", author.getAuthorId());
                response.put("authorName", author.getAuthorName());
                response.put("realName", author.getRealName());
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "작가를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving author name: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "작가 이름 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}