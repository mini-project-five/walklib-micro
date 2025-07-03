package miniproject.infra;

import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
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

import java.util.stream.Collectors;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/books")
@Transactional
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    BookRepository bookRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Book> books = (List<Book>) bookRepository.findAll();
            
            response.put("success", true);
            response.put("_embedded", Map.of("books", books));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting all books: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Book> book = bookRepository.findById(id);
            
            if (book.isPresent()) {
                // Increment view count when book is accessed
                Book.incrementViewCount(id);
                
                response.put("success", true);
                response.put("book", book.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Book not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error getting book by id: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<Map<String, Object>> getBestsellers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Book> bestsellers = bookRepository.findByIsBestseller(true);
            
            response.put("success", true);
            response.put("_embedded", Map.of("books", bestsellers));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting bestsellers: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/new")
    public ResponseEntity<Map<String, Object>> getNewBooks() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get books published in the last 30 days (simplified version)
            List<Book> newBooks = bookRepository.findByStatusOrderByBookIdDesc("PUBLISHED");
            
            response.put("success", true);
            response.put("_embedded", Map.of("books", newBooks.stream().limit(10).collect(Collectors.toList())));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting new books: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<Map<String, Object>> getByAuthor(@PathVariable("authorId") Long authorId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Book> books = bookRepository.findByAuthorId(authorId);
            
            response.put("success", true);
            response.put("_embedded", Map.of("books", books));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting books by author: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBook(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String title = (String) request.get("title");
            String content = (String) request.get("content");
            Double price = Double.valueOf(request.get("price").toString());
            Long authorId = Long.valueOf(request.get("authorId").toString());
            
            if (title == null || content == null || price == null || authorId == null) {
                response.put("success", false);
                response.put("error", "Title, content, price, and authorId are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            Book book = new Book();
            book.setTitle(title);
            book.setContent(content);
            book.setAuthorId(authorId);
            book.setViewCount(0);
            book.setIsBestseller(false);
            book.setStatus("PUBLISHED");
            
            // Set optional fields
            if (request.containsKey("summary")) {
                book.setSummary((String) request.get("summary"));
            }
            if (request.containsKey("coverImageUrl")) {
                book.setCoverImageUrl((String) request.get("coverImageUrl"));
            }
            if (request.containsKey("manuscriptId")) {
                book.setManuscriptId(Long.valueOf(request.get("manuscriptId").toString()));
            }
            
            Book savedBook = bookRepository.save(book);
            
            response.put("success", true);
            response.put("book", savedBook);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error creating book: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBook(
        @PathVariable("id") Long id,
        @RequestBody Map<String, Object> updates
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Book> optionalBook = bookRepository.findById(id);
            
            if (optionalBook.isPresent()) {
                Book book = optionalBook.get();
                
                // Update fields if provided
                if (updates.containsKey("title")) {
                    book.setTitle((String) updates.get("title"));
                }
                if (updates.containsKey("content")) {
                    book.setContent((String) updates.get("content"));
                }
                if (updates.containsKey("summary")) {
                    book.setSummary((String) updates.get("summary"));
                }
                if (updates.containsKey("coverImageUrl")) {
                    book.setCoverImageUrl((String) updates.get("coverImageUrl"));
                }
                if (updates.containsKey("status")) {
                    book.setStatus((String) updates.get("status"));
                }
                
                Book savedBook = bookRepository.save(book);
                
                response.put("success", true);
                response.put("book", savedBook);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Book not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error updating book: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Map<String, Object>> incrementView(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Book.incrementViewCount(id);
            
            Optional<Book> updatedBook = bookRepository.findById(id);
            if (updatedBook.isPresent()) {
                response.put("success", true);
                response.put("book", updatedBook.get());
                response.put("message", "View count incremented");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Book not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error incrementing view count: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<Map<String, Object>> addRating(@PathVariable("id") Long id, @RequestBody Map<String, Integer> ratingData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Integer rating = ratingData.get("rating");
            if (rating == null || rating < 1 || rating > 5) {
                response.put("success", false);
                response.put("error", "Rating must be between 1 and 5");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Optional<Book> bookOptional = bookRepository.findById(id);
            if (bookOptional.isPresent()) {
                Book book = bookOptional.get();
                book.setTotalRating(book.getTotalRating() + rating);
                book.setRatingCount(book.getRatingCount() + 1);
                bookRepository.save(book);
                
                double averageRating = (double) book.getTotalRating() / book.getRatingCount();
                
                response.put("success", true);
                response.put("book", book);
                response.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
                response.put("message", "Rating added successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Book not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error adding rating: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBook(@PathVariable("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (bookRepository.existsById(id)) {
                bookRepository.deleteById(id);
                response.put("success", true);
                response.put("message", "Book deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Book not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error deleting book: " + e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
