package miniproject.domain;

import java.util.Date;
import java.util.List;
import miniproject.domain.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "points", path = "points")
public interface PointRepository
    extends PagingAndSortingRepository<Point, Long> {
    
    // 사용자별 포인트 내역 조회 (생성일시 역순)
    List<Point> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 사용자별 포인트 내역 조회 (기본)
    List<Point> findByUserId(Long userId);
}
//>>> PoEAA / Repository
