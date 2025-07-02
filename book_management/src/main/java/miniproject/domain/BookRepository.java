package miniproject.domain;

import java.util.Date;
import java.util.List;
import miniproject.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

//<<< PoEAA / Repository
public interface BookRepository
    extends JpaRepository<Book, Long> {
    
    // 작가별 도서 조회
    List<Book> findByAuthorId(Long authorId);
    
    // 상태별 도서 조회 (출간된 도서만)
    List<Book> findByStatus(String status);
    
    // 작가별 상태별 도서 조회
    List<Book> findByAuthorIdAndStatus(Long authorId, String status);
    
    // 모든 도서 조회
    @Query("SELECT b FROM Book b")
    List<Book> findAllBooks();
}
