package miniproject.infra;

import java.util.List;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/points")
@Transactional
public class PointController {

    private static final Logger logger = LoggerFactory.getLogger(PointController.class);

    @Autowired
    PointRepository pointRepository;

    // 사용자별 포인트 현재 잔액 조회
    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<Integer> getUserPointBalance(@PathVariable Long userId) {
        logger.info("GET /points/user/{}/balance - 사용자 포인트 잔액 조회", userId);
        
        List<Point> userPoints = pointRepository.findByUserId(userId);
        int totalBalance = userPoints.stream()
            .mapToInt(Point::getPointBalance)
            .max()
            .orElse(0);
        
        logger.info("사용자 ID {}의 포인트 잔액: {}", userId, totalBalance);
        return ResponseEntity.ok(totalBalance);
    }

    // 사용자별 포인트 내역 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Point>> getUserPoints(@PathVariable Long userId) {
        logger.info("GET /points/user/{} - 사용자 포인트 내역 조회", userId);
        List<Point> points = pointRepository.findByUserId(userId);
        logger.info("사용자 ID {}의 포인트 내역 수: {}", userId, points.size());
        return ResponseEntity.ok(points);
    }

    // 신규 가입 포인트 지급 (기본 1,000 + KT 고객 5,000)
    @PostMapping("/signup")
    public ResponseEntity<Point> giveSignupPoints(@RequestBody SignupPointRequest request) {
        logger.info("POST /points/signup - 신규 가입 포인트 지급: userId={}, isKtCustomer={}", 
                   request.getUserId(), request.isKtCustomer());
        
        // 기본 신규 가입 포인트 1,000
        int signupPoints = 1000;
        
        // KT 고객일 경우 추가 5,000
        if (request.isKtCustomer()) {
            signupPoints += 5000;
        }
        
        Point point = new Point();
        point.setUserId(request.getUserId());
        point.setPointBalance(signupPoints);
        point.setAmount(signupPoints);
        point.setPointType(request.isKtCustomer() ? "KT_SIGNUP" : "SIGNUP");
        point.setDescription(request.isKtCustomer() ? 
            "신규 가입 포인트 (KT 고객 보너스 포함)" : "신규 가입 포인트");
        
        Point savedPoint = pointRepository.save(point);
        logger.info("신규 가입 포인트 지급 완료: {}포인트", signupPoints);
        return ResponseEntity.ok(savedPoint);
    }

    // 포인트 사용 (도서 구매)
    @PostMapping("/use")
    public ResponseEntity<Point> usePoints(@RequestBody UsePointRequest request) {
        logger.info("POST /points/use - 포인트 사용: userId={}, amount={}", 
                   request.getUserId(), request.getAmount());
        
        // 현재 잔액 확인
        List<Point> userPoints = pointRepository.findByUserId(request.getUserId());
        int currentBalance = userPoints.stream()
            .mapToInt(Point::getPointBalance)
            .max()
            .orElse(0);
        
        if (currentBalance < request.getAmount()) {
            logger.warn("포인트 부족: 현재잔액={}, 사용요청={}", currentBalance, request.getAmount());
            return ResponseEntity.badRequest().build();
        }
        
        int newBalance = currentBalance - request.getAmount();
        
        Point point = new Point();
        point.setUserId(request.getUserId());
        point.setPointBalance(newBalance);
        point.setAmount(-request.getAmount()); // 음수로 저장
        point.setPointType("USAGE");
        point.setDescription(request.getDescription() != null ? 
            request.getDescription() : "도서 구매");
        
        Point savedPoint = pointRepository.save(point);
        logger.info("포인트 사용 완료: {}포인트 사용, 잔액: {}", request.getAmount(), newBalance);
        return ResponseEntity.ok(savedPoint);
    }

    // 포인트 충전
    @PostMapping("/charge")
    public ResponseEntity<Point> chargePoints(@RequestBody ChargePointRequest request) {
        logger.info("POST /points/charge - 포인트 충전: userId={}, amount={}", 
                   request.getUserId(), request.getAmount());
        
        // 현재 잔액 조회
        List<Point> userPoints = pointRepository.findByUserId(request.getUserId());
        int currentBalance = userPoints.stream()
            .mapToInt(Point::getPointBalance)
            .max()
            .orElse(0);
        
        int newBalance = currentBalance + request.getAmount();
        
        Point point = new Point();
        point.setUserId(request.getUserId());
        point.setPointBalance(newBalance);
        point.setAmount(request.getAmount());
        point.setPointType("CHARGE");
        point.setDescription("포인트 충전");
        
        Point savedPoint = pointRepository.save(point);
        logger.info("포인트 충전 완료: {}포인트", request.getAmount());
        return ResponseEntity.ok(savedPoint);
    }
    
    // KT 승인 후 보너스 포인트 지급
    @PostMapping("/kt-bonus")
    public ResponseEntity<Point> giveKtBonus(@RequestBody KtBonusRequest request) {
        logger.info("POST /points/kt-bonus - KT 보너스 포인트 지급: userId={}, amount={}", 
                   request.getUserId(), request.getAmount());
        
        // 현재 잔액 확인
        List<Point> userPoints = pointRepository.findByUserId(request.getUserId());
        int currentBalance = userPoints.stream()
            .mapToInt(Point::getPointBalance)
            .max()
            .orElse(0);
        
        int newBalance = currentBalance + request.getAmount();
        
        Point point = new Point();
        point.setUserId(request.getUserId());
        point.setPointBalance(newBalance);
        point.setAmount(request.getAmount());
        point.setPointType("KT_BONUS");
        point.setDescription("KT 고객 인증 승인 보너스");
        
        Point savedPoint = pointRepository.save(point);
        logger.info("KT 보너스 포인트 지급 완료: {}포인트 (총 잔액: {}포인트)", request.getAmount(), newBalance);
        return ResponseEntity.ok(savedPoint);
    }

    // Request DTOs
    public static class SignupPointRequest {
        private Long userId;
        private boolean ktCustomer;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public boolean isKtCustomer() { return ktCustomer; }
        public void setKtCustomer(boolean ktCustomer) { this.ktCustomer = ktCustomer; }
    }
    
    public static class UsePointRequest {
        private Long userId;
        private Integer amount;
        private String description;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class ChargePointRequest {
        private Long userId;
        private Integer amount;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
    }
    
    public static class KtBonusRequest {
        private Long userId;
        private Integer amount;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
    }
}
//>>> Clean Arch / Inbound Adaptor
