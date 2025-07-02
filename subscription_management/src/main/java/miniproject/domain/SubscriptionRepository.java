package miniproject.domain;

import miniproject.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import java.util.Date;
import java.util.List;
import java.util.Optional;

//<<< PoEAA / Repository
@RepositoryRestResource(
    collectionResourceRel = "subscriptions",
    path = "subscriptions"
)
public interface SubscriptionRepository
    extends PagingAndSortingRepository<Subscription, Long> {
    
    // 기존 메서드들 (enum 타입 지원)
    Optional<Subscription> findByUserIdAndStatus(Long userId, Subscription.SubscriptionStatus status);
    
    List<Subscription> findByUserId(Long userId);
    
    // 자동 만료 처리용
    List<Subscription> findByEndDateBeforeAndStatusIn(Date endDate, List<Subscription.SubscriptionStatus> statuses);
    
    // 자동 갱신 처리용
    List<Subscription> findByNextBillingDateBeforeAndStatusAndAutoRenewal(
        Date nextBillingDate, 
        Subscription.SubscriptionStatus status, 
        Boolean autoRenewal
    );
    
    // 상태별 조회
    List<Subscription> findByStatus(Subscription.SubscriptionStatus status);
    
    // 플랜별 조회
    List<Subscription> findByPlanType(Subscription.PlanType planType);
    
    // 사용자별 활성 구독 존재 여부
    boolean existsByUserIdAndStatus(Long userId, Subscription.SubscriptionStatus status);
}
