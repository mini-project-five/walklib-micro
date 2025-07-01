package miniproject.domain;

import java.util.Date;
import java.util.List;
import miniproject.domain.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(
    collectionResourceRel = "manuscripts",
    path = "manuscripts"
)
public interface ManuscriptRepository
    extends PagingAndSortingRepository<Manuscript, Long> {
    
    List<Manuscript> findByAuthorId(Long authorId);
    
    List<Manuscript> findByStatus(String status);
    
    List<Manuscript> findByAuthorIdAndStatus(Long authorId, String status);
    
    @Query("SELECT m FROM Manuscript m ORDER BY m.manuscriptId DESC")
    List<Manuscript> findAllOrderByIdDesc(Pageable pageable);
}
