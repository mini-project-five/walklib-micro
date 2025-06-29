package miniproject.infra;

import java.util.List;
import miniproject.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(
    collectionResourceRel = "authorManagementViews",
    path = "authorManagementViews"
)
public interface AuthorManagementViewRepository
    extends PagingAndSortingRepository<AuthorManagementView, Long> {}
