package miniproject.domain;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import miniproject.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(
    collectionResourceRel = "authorManagements",
    path = "authorManagements"
)
public interface AuthorManagementRepository
    extends PagingAndSortingRepository<AuthorManagement, Long> {
    
    // 작가 ID로 조회
    Optional<AuthorManagement> findByAuthorId(Long authorId);
    
    // 상태별 조회 (페이지네이션 지원)
    Page<AuthorManagement> findByManagementStatusOrderByReviewedAtDesc(ManagementStatus managementStatus, Pageable pageable);
    
    // 모든 요청 조회 (최신순)
    Page<AuthorManagement> findAllByOrderByReviewedAtDesc(Pageable pageable);
    
    // 상태별 개수 조회
    long countByManagementStatus(ManagementStatus managementStatus);
    
    // 특정 기간 이후 신청 개수
    long countByReviewedAtAfter(Date date);
    
    // 이메일로 조회
    Optional<AuthorManagement> findByEmail(String email);
    
    // 작가명으로 검색
    Page<AuthorManagement> findByAuthorNameContainingIgnoreCase(String authorName, Pageable pageable);
    
    // 이메일로 검색
    Page<AuthorManagement> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    
    // 상태와 작가명으로 검색
    Page<AuthorManagement> findByManagementStatusAndAuthorNameContainingIgnoreCase(ManagementStatus managementStatus, String authorName, Pageable pageable);
    
    // 승인 대기 중인 요청들 (오래된 순)
    List<AuthorManagement> findByManagementStatusOrderByReviewedAtAsc(ManagementStatus managementStatus);
    
    // 특정 날짜 범위의 신청들
    Page<AuthorManagement> findByReviewedAtBetween(Date startDate, Date endDate, Pageable pageable);
}
