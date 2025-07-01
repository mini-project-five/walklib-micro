package miniproject.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/authors")
@Transactional
public class AuthorController {

    private static final Logger logger = LoggerFactory.getLogger(AuthorController.class);

    @Autowired
    AuthorRepository authorRepository;
    
    @PostMapping
    public ResponseEntity<Author> createAuthor(@RequestBody Author author) {
        logger.info("=== Author Registration Request ===");
        logger.info("Received author data: {}", author);
        logger.info("Author Name: {}", author.getAuthorName());
        logger.info("Email: {}", author.getEmail());
        logger.info("Introduction: {}", author.getIntroduction());
        logger.info("Real Name: {}", author.getRealName());
        logger.info("Password: {}", author.getAuthorPassword() != null ? "***PROVIDED***" : "NULL");
        logger.info("Register Status: {}", author.getAuthorRegisterStatus());
        
        try {
            // Set default status if not provided
            if (author.getAuthorRegisterStatus() == null) {
                author.setAuthorRegisterStatus(AuthorRegisterStatus.PENDING);
                logger.info("Set default status to PENDING");
            }
            
            Author savedAuthor = authorRepository.save(author);
            logger.info("Author successfully created with ID: {}", savedAuthor.getAuthorId());
            return ResponseEntity.ok(savedAuthor);
            
        } catch (Exception e) {
            logger.error("Error creating author: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Author> updateAuthor(@PathVariable Long id, @RequestBody Author updates) {
        logger.info("=== Author Update Request ===");
        logger.info("Author ID: {}", id);
        logger.info("Updates: {}", updates);
        
        Optional<Author> authorOpt = authorRepository.findById(id);
        if (authorOpt.isPresent()) {
            Author author = authorOpt.get();
            
            if (updates.getAuthorRegisterStatus() != null) {
                author.setAuthorRegisterStatus(updates.getAuthorRegisterStatus());
                logger.info("Updated status to: {}", updates.getAuthorRegisterStatus());
            }
            
            Author savedAuthor = authorRepository.save(author);
            logger.info("Author successfully updated");
            return ResponseEntity.ok(savedAuthor);
        } else {
            logger.warn("Author not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllAuthors() {
        logger.info("=== Get All Authors Request ===");
        try {
            Iterable<Author> authors = authorRepository.findAll();
            return ResponseEntity.ok(authors);
        } catch (Exception e) {
            logger.error("Error getting authors: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthor(@PathVariable Long id) {
        logger.info("=== Get Author Request ===");
        logger.info("Author ID: {}", id);
        
        Optional<Author> authorOpt = authorRepository.findById(id);
        if (authorOpt.isPresent()) {
            return ResponseEntity.ok(authorOpt.get());
        } else {
            logger.warn("Author not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Author> getAuthorByEmail(@PathVariable String email) {
        logger.info("=== Get Author By Email Request ===");
        logger.info("Email: {}", email);
        
        try {
            // 이메일로 작가 찾기 (간단한 구현)
            Iterable<Author> authors = authorRepository.findAll();
            for (Author author : authors) {
                if (email.equals(author.getEmail())) {
                    return ResponseEntity.ok(author);
                }
            }
            logger.warn("Author not found with email: {}", email);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error getting author by email: ", e);
            return ResponseEntity.status(500).build();
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
