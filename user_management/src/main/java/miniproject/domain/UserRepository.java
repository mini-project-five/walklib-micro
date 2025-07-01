package miniproject.domain;

import java.util.Optional;
import miniproject.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "users", path = "users")
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
    // 'email' 필드로 사용자를 찾기 위한 메소드
    Optional<User> findByEmail(String email);
}
