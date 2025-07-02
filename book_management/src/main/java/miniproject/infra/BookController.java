package miniproject.infra;

import java.util.List;
import java.util.Optional;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/books")
@Transactional
public class BookController {

    private static final Logger logger = LoggerFactory.getLogger(BookController.class);

    @Autowired
    BookRepository bookRepository;

    // 모든 도서 조회
    @GetMapping(value = "")
    public ResponseEntity<List<Book>> getAllBooks() {
        logger.info("GET /books - 모든 도서 조회");
        List<Book> books = bookRepository.findAllBooks();
        logger.info("조회된 도서 수: {}", books.size());
        return ResponseEntity.ok(books);
    }

    // 특정 도서 조회
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        logger.info("GET /books/{} - 도서 조회", id);
        Optional<Book> book = bookRepository.findById(id);
        if (book.isPresent()) {
            logger.info("도서 조회 성공: {}", book.get().getTitle());
            return ResponseEntity.ok(book.get());
        } else {
            logger.warn("도서를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // 도서 생성 (원고 저장)
    @PostMapping(value = "")
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        logger.info("POST /books - 도서 생성: {}", book.getTitle());
        if (book.getStatus() == null) {
            book.setStatus("DRAFT");
        }
        Book savedBook = bookRepository.save(book);
        logger.info("도서 생성 성공: ID={}, 상태={}", savedBook.getBookId(), savedBook.getStatus());
        return ResponseEntity.ok(savedBook);
    }

    // 도서 수정
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        logger.info("PUT /books/{} - 도서 수정", id);
        Optional<Book> bookOptional = bookRepository.findById(id);
        if (bookOptional.isPresent()) {
            Book book = bookOptional.get();
            book.setTitle(bookDetails.getTitle());
            book.setAuthorId(bookDetails.getAuthorId());
            book.setStatus(bookDetails.getStatus());
            if (bookDetails.getViewCount() != null) {
                book.setViewCount(bookDetails.getViewCount());
            }
            if (bookDetails.getIsBestseller() != null) {
                book.setIsBestseller(bookDetails.getIsBestseller());
            }
            Book updatedBook = bookRepository.save(book);
            logger.info("도서 수정 성공: ID={}, 상태={}", updatedBook.getBookId(), updatedBook.getStatus());
            return ResponseEntity.ok(updatedBook);
        } else {
            logger.warn("수정할 도서를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // 도서 출간 (상태 변경)
    @PatchMapping("/{id}/publish")
    public ResponseEntity<Book> publishBook(@PathVariable Long id) {
        logger.info("PATCH /books/{}/publish - 도서 출간", id);
        Optional<Book> bookOptional = bookRepository.findById(id);
        if (bookOptional.isPresent()) {
            Book book = bookOptional.get();
            book.setStatus("PUBLISHED");
            Book publishedBook = bookRepository.save(book);
            logger.info("도서 출간 성공: ID={}, 제목={}", publishedBook.getBookId(), publishedBook.getTitle());
            return ResponseEntity.ok(publishedBook);
        } else {
            logger.warn("출간할 도서를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // 작가별 도서 조회
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Book>> getBooksByAuthor(@PathVariable Long authorId) {
        logger.info("GET /books/author/{} - 작가별 도서 조회", authorId);
        List<Book> books = bookRepository.findByAuthorId(authorId);
        logger.info("작가 ID {}의 도서 수: {}", authorId, books.size());
        return ResponseEntity.ok(books);
    }

    // 출간된 도서만 조회 (독자용)
    @GetMapping("/published")
    public ResponseEntity<List<Book>> getPublishedBooks() {
        logger.info("GET /books/published - 출간된 도서 조회");
        List<Book> books = bookRepository.findByStatus("PUBLISHED");
        logger.info("출간된 도서 수: {}", books.size());
        return ResponseEntity.ok(books);
    }

    // 작가별 출간된 도서 조회
    @GetMapping("/author/{authorId}/published")
    public ResponseEntity<List<Book>> getPublishedBooksByAuthor(@PathVariable Long authorId) {
        logger.info("GET /books/author/{}/published - 작가별 출간된 도서 조회", authorId);
        List<Book> books = bookRepository.findByAuthorIdAndStatus(authorId, "PUBLISHED");
        logger.info("작가 ID {}의 출간된 도서 수: {}", authorId, books.size());
        return ResponseEntity.ok(books);
    }

    // 도서 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        logger.info("DELETE /books/{} - 도서 삭제", id);
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            logger.info("도서 삭제 성공: ID={}", id);
            return ResponseEntity.noContent().build();
        } else {
            logger.warn("삭제할 도서를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // 도서 조회수 증가 (독자가 책을 열 때)
    @PatchMapping("/{id}/view")
    public ResponseEntity<Book> incrementViewCount(@PathVariable Long id) {
        logger.info("PATCH /books/{}/view - 도서 조회수 증가", id);
        Optional<Book> bookOptional = bookRepository.findById(id);
        if (bookOptional.isPresent()) {
            Book book = bookOptional.get();
            book.setViewCount(book.getViewCount() + 1);
            
            // 조회수가 10 이상이면 베스트셀러로 자동 설정
            if (book.getViewCount() >= 10) {
                book.setIsBestseller(true);
                logger.info("도서 ID={}가 베스트셀러로 승격됨 (조회수: {})", id, book.getViewCount());
            }
            
            Book updatedBook = bookRepository.save(book);
            logger.info("도서 조회수 증가 성공: ID={}, 조회수={}", updatedBook.getBookId(), updatedBook.getViewCount());
            return ResponseEntity.ok(updatedBook);
        } else {
            logger.warn("조회수 증가할 도서를 찾을 수 없음: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
