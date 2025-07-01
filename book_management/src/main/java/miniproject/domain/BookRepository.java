package miniproject.domain;

import java.util.Date;
import java.util.List;
import miniproject.domain.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "books", path = "books")
public interface BookRepository
    extends PagingAndSortingRepository<Book, Long> {
    
    java.util.Optional<Book> findByManuscriptId(Long manuscriptId);
    
    List<Book> findByAuthorId(Long authorId);
    
    List<Book> findByIsBestseller(Boolean isBestseller);
    
    List<Book> findByStatus(String status);
    
    List<Book> findByStatusOrderByBookIdDesc(String status);
    
    @Query("SELECT b FROM Book b WHERE b.status = 'PUBLISHED' ORDER BY b.bookId DESC")
    List<Book> findPublishedBooksOrderByIdDesc(Pageable pageable);
}
