package miniproject.domain;

import java.util.Optional;
import miniproject.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import java.util.List;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "users", path = "users")
public interface UserRepository
    extends PagingAndSortingRepository<User, Long> {
    
    // KT 인증 대기 중인 사용자 조회
    List<User> findByKtAuthRequestedTrueAndKtAuthApprovedFalse();
    
    // 이메일로 사용자 찾기
    User findByEmail(String email);
}
