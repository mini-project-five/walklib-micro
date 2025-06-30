package miniproject.domain;

import miniproject.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "users", path = "users")
public interface UserRepository
    extends PagingAndSortingRepository<User, Long> {
    
    java.util.Optional<User> findByEmail(String email);
    
    java.util.List<User> findByRole(String role);
    
    java.util.List<User> findByStatus(String status);
}
