package miniproject.domain;

import java.util.List;
import miniproject.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(
    collectionResourceRel = "subscriptions",
    path = "subscriptions"
)
public interface SubscriptionRepository
    extends PagingAndSortingRepository<Subscription, Long> {
    
    // 사용자별 구독 내역 조회
    List<Subscription> findByUserId(Long userId);
    
    // 사용자별 특정 상태의 구독 조회
    List<Subscription> findByUserIdAndStatus(Long userId, String status);
    
    // 사용자별 구독 내역 조회 (생성일시 역순)
    List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);
}
//>>> PoEAA / Repository
