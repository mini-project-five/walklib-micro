package miniproject.domain;

import miniproject.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;

//<<< PoEAA / Repository
@Repository
public interface UserRepository
    extends JpaRepository<User, Long> {
    
    java.util.Optional<User> findByEmail(String email);
    
    java.util.Optional<User> findByEmailAndUserPassword(String email, String userPassword);
    
    java.util.Optional<User> findByUserName(String userName);
    
    java.util.List<User> findByRole(String role);
    
    java.util.List<User> findByStatus(String status);
    
    // 관리자 기능을 위한 추가 쿼리 메서드들
    
    // 역할별 사용자 수 조회
    long countByRole(String role);
    
    // 상태별 사용자 수 조회
    long countByStatus(String status);
    
    // 등록일 이후 사용자 수 조회
    long countByRegisteredAtAfter(Date date);
    
    // 검색 기능을 위한 페이지네이션 지원 메서드들
    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    
    Page<User> findByUserNameContainingIgnoreCase(String userName, Pageable pageable);
    
    Page<User> findByRole(String role, Pageable pageable);
    
    Page<User> findByStatus(String status, Pageable pageable);
    
    // 복합 검색 조건
    Page<User> findByRoleAndStatus(String role, String status, Pageable pageable);
    
    Page<User> findByEmailContainingIgnoreCaseAndRole(String email, String role, Pageable pageable);
    
    Page<User> findByUserNameContainingIgnoreCaseAndRole(String userName, String role, Pageable pageable);
}
