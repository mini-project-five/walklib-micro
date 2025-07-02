package miniproject.infra;

import java.util.List;
import miniproject.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(
    collectionResourceRel = "pointLists",
    path = "pointLists"
)
public interface PointListRepository
    extends PagingAndSortingRepository<PointList, Long> {
    
    List<PointList> findByUserId(Long userId);
}
