package miniproject.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Date;
import javax.naming.NameParser;
import javax.naming.NameParser;
import javax.transaction.Transactional;
import miniproject.config.kafka.KafkaProcessor;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

//<<< Clean Arch / Inbound Adaptor
@Service
@Transactional
public class PolicyHandler {

    @Autowired
    PointRepository pointRepository;
    
    @Autowired
    PointListRepository pointListRepository;

    /**
     * 구독 활성화 이벤트 처리
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='SubscriptionActivated'"
    )
    public void wheneverSubscriptionActivated_HandleSubscriptionPayment(
        @Payload SubscriptionActivated subscriptionActivated
    ) {
        try {
            if (!subscriptionActivated.validate()) return;
            
            System.out.println(
                "\n\n##### listener HandleSubscriptionPayment : " + subscriptionActivated + "\n\n"
            );

            // 구독료 계산 (planType에 따라)
            Integer cost = calculateSubscriptionCost(subscriptionActivated.getPlan());
            
            // Point 도메인의 비즈니스 로직 호출
            Point.handleSubscriptionActivated(subscriptionActivated.getUserId(), cost);

        } catch (Exception e) {
            System.err.println("Error processing SubscriptionActivated event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 사용자 등록 이벤트 처리 - 웰컴 포인트 지급
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='UserRegistered'"
    )
    public void wheneverUserRegistered_GiveWelcomePoints(
        @Payload UserRegistered userRegistered
    ) {
        try {
            if (!userRegistered.validate()) return;
            
            System.out.println(
                "\n\n##### listener GiveWelcomePoints : " + userRegistered + "\n\n"
            );

            // 신규 사용자에게 웰컴 포인트 지급 (1000 포인트)
            Point.purchasePoints(userRegistered.getUserId(), 1000);
            
            System.out.println("Welcome points (1000) given to user: " + userRegistered.getUserId());

        } catch (Exception e) {
            System.err.println("Error processing UserRegistered event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 책 구매 이벤트 처리
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='BookPurchased'"
    )
    public void wheneverBookPurchased_DeductPoints(
        @Payload BookPurchased bookPurchased
    ) {
        try {
            if (!bookPurchased.validate()) return;
            
            System.out.println(
                "\n\n##### listener DeductPoints : " + bookPurchased + "\n\n"
            );

            // 포인트 차감 로직
            pointRepository.findByUserId(bookPurchased.getUserId()).ifPresentOrElse(
                point -> {
                    Integer bookPrice = bookPurchased.getPrice() != null ? bookPurchased.getPrice() : 10;
                    
                    if (point.getPointBalance() >= bookPrice) {
                        point.setPointBalance(point.getPointBalance() - bookPrice);
                        point.setTransactionType("USE");
                        point.setTransactionAmount(bookPrice);
                        point.setDescription("Book purchase: " + bookPurchased.getBookTitle());
                        pointRepository.save(point);
                        
                        // CQRS 업데이트
                        updatePointList(point);
                        
                        System.out.println("Points deducted for book purchase. Remaining: " + point.getPointBalance());
                    } else {
                        System.out.println("Insufficient points for book purchase");
                        // 필요시 PointsInsufficient 이벤트 발행
                    }
                },
                () -> System.out.println("No point account found for user: " + bookPurchased.getUserId())
            );

        } catch (Exception e) {
            System.err.println("Error processing BookPurchased event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * KT 고객 포인트 추가 이벤트 처리
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='KtCustomerVerified'"
    )
    public void wheneverKtCustomerVerified_AddKtPoints(
        @Payload KtCustomerVerified ktCustomerVerified
    ) {
        try {
            if (!ktCustomerVerified.validate()) return;
            
            System.out.println(
                "\n\n##### listener AddKtPoints : " + ktCustomerVerified + "\n\n"
            );

            // KT 고객에게 보너스 포인트 지급 (5000 포인트)
            Point.purchasePoints(ktCustomerVerified.getUserId(), 5000);
            
            System.out.println("KT customer bonus points (5000) given to user: " + ktCustomerVerified.getUserId());

        } catch (Exception e) {
            System.err.println("Error processing KtCustomerVerified event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 책 읽기 이벤트 처리 - 포인트 차감
     */
    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='BookRead'"
    )
    public void wheneverBookRead_DeductPointsForReading(
        @Payload BookRead bookRead
    ) {
        try {
            if (!bookRead.validate()) return;
            
            System.out.println(
                "\n\n##### listener DeductPointsForReading : " + bookRead + "\n\n"
            );

            // 포인트 차감 로직
            pointRepository.findByUserId(bookRead.getUserId()).ifPresentOrElse(
                point -> {
                    Integer pointCost = bookRead.getPointCost() != null ? bookRead.getPointCost() : 10;
                    
                    if (point.getPointBalance() >= pointCost) {
                        point.setPointBalance(point.getPointBalance() - pointCost);
                        point.setTransactionType("USE");
                        point.setTransactionAmount(pointCost);
                        point.setDescription("Book reading: " + bookRead.getTitle());
                        pointRepository.save(point);
                        
                        // CQRS 업데이트
                        updatePointList(point);
                        
                        System.out.println("Points deducted for book reading. Book: " + bookRead.getTitle() + 
                                         ", Cost: " + pointCost + ", Remaining: " + point.getPointBalance());
                    } else {
                        System.out.println("Insufficient points for book reading. Required: " + pointCost + 
                                         ", Available: " + point.getPointBalance());
                    }
                },
                () -> System.out.println("No point account found for user: " + bookRead.getUserId())
            );

        } catch (Exception e) {
            System.err.println("Error processing BookRead event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 일반 이벤트 처리기 (디버깅용)
     */
    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            
            // 이벤트 로깅
            System.out.println("Point Service received event: " + eventString);
            
        } catch (Exception e) {
            System.err.println("Error processing generic event: " + e.getMessage());
        }
    }

    /**
     * 구독료 계산 헬퍼 메서드
     */
    private Integer calculateSubscriptionCost(String planType) {
        if ("PREMIUM".equalsIgnoreCase(planType)) {
            return 29900;
        } else if ("BASIC".equalsIgnoreCase(planType)) {
            return 9900;
        }
        return 9900; // 기본값
    }

    /**
     * CQRS를 위한 PointList 업데이트
     */
    private void updatePointList(Point point) {
        try {
            PointList pointList = new PointList();
            pointList.setUserId(point.getUserId());
            pointList.setCurrentBalance(point.getPointBalance());
            pointList.setTransactionDate(new Date());
            pointList.setAmount(point.getTransactionAmount());
            pointList.setReason(point.getDescription());
            pointList.setTransactionType(point.getTransactionType());
            
            pointListRepository.save(pointList);
            
        } catch (Exception e) {
            System.err.println("Error updating PointList: " + e.getMessage());
        }
    }

    // 이벤트 객체들 (간단한 구현)
    public static class SubscriptionActivated {
        private Long userId;
        private String plan;
        private Long subscriptionId;
        
        // getters, setters, validate() 메서드
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getPlan() { return plan; }
        public void setPlan(String plan) { this.plan = plan; }
        public Long getSubscriptionId() { return subscriptionId; }
        public void setSubscriptionId(Long subscriptionId) { this.subscriptionId = subscriptionId; }
        public boolean validate() { return userId != null && plan != null; }
    }

    public static class UserRegistered {
        private Long userId;
        private String email;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public boolean validate() { return userId != null; }
    }

    public static class BookPurchased {
        private Long userId;
        private Long bookId;
        private String bookTitle;
        private Integer price;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }
        public String getBookTitle() { return bookTitle; }
        public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
        public Integer getPrice() { return price; }
        public void setPrice(Integer price) { this.price = price; }
        public boolean validate() { return userId != null && bookId != null; }
    }

    public static class KtCustomerVerified {
        private Long userId;
        private Boolean isKtCustomer;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Boolean getIsKtCustomer() { return isKtCustomer; }
        public void setIsKtCustomer(Boolean isKtCustomer) { this.isKtCustomer = isKtCustomer; }
        public boolean validate() { return userId != null && Boolean.TRUE.equals(isKtCustomer); }
    }

    public static class BookRead {
        private Long bookId;
        private Long userId;
        private String title;
        private Integer pointCost;
        private Boolean isFree;
        
        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getPointCost() { return pointCost; }
        public void setPointCost(Integer pointCost) { this.pointCost = pointCost; }
        public Boolean getIsFree() { return isFree; }
        public void setIsFree(Boolean isFree) { this.isFree = isFree; }
        public boolean validate() { return userId != null && bookId != null && !Boolean.TRUE.equals(isFree); }
    }
}
//>>> Clean Arch / Inbound Adaptor
