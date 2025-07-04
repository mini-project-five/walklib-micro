package miniproject.infra;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import miniproject.domain.*;
import miniproject.infra.GlobalExceptionHandler.InsufficientPointsException;
import miniproject.infra.GlobalExceptionHandler.PointAccountNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/points")
@CrossOrigin(origins = "*")
@Transactional
public class PointController {

    private static final Logger logger = LoggerFactory.getLogger(PointController.class);

    @Autowired
    PointRepository pointRepository;

    @Autowired
    PointListRepository pointListRepository;

    /**
     * 사용자 포인트 잔액 조회
     */
    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<Map<String, Object>> getUserPointBalance(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Point> pointOpt = pointRepository.findByUserId(userId);
            
            if (pointOpt.isPresent()) {
                response.put("success", true);
                response.put("userId", userId);
                response.put("pointBalance", pointOpt.get().getPointBalance());
                response.put("point", pointOpt.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", true);
                response.put("userId", userId);
                response.put("pointBalance", 0);
                response.put("message", "포인트 계정이 없습니다.");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "포인트 잔액 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 포인트 구매
     */
    @PostMapping("/purchase")
    public ResponseEntity<Map<String, Object>> purchasePoints(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Integer amount = Integer.valueOf(request.get("amount").toString());
            
            // 입력 검증
            if (userId == null || amount == null || amount <= 0) {
                response.put("success", false);
                response.put("error", "유효하지 않은 입력값입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 비즈니스 로직 실행
            Point.purchasePoints(userId, amount);
            
            // 업데이트된 포인트 정보 반환
            Optional<Point> updatedPoint = pointRepository.findByUserId(userId);
            
            response.put("success", true);
            response.put("message", "포인트 구매가 완료되었습니다.");
            response.put("userId", userId);
            response.put("purchasedAmount", amount);
            
            if (updatedPoint.isPresent()) {
                response.put("newBalance", updatedPoint.get().getPointBalance());
                response.put("point", updatedPoint.get());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("error", "숫자 형식이 올바르지 않습니다.");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "포인트 구매 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 포인트 사용 (구독, 책 구매 등)
     */
    @PostMapping("/use")
    public ResponseEntity<Map<String, Object>> usePoints(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Integer amount = Integer.valueOf(request.get("amount").toString());
            String description = request.getOrDefault("description", "포인트 사용").toString();
            
            logger.info("Point usage request - userId: {}, amount: {}, description: {}", userId, amount, description);
            
            Optional<Point> pointOpt = pointRepository.findByUserId(userId);
            
            if (pointOpt.isEmpty()) {
                throw new PointAccountNotFoundException("포인트 계정이 존재하지 않습니다.", userId);
            }
            
            Point point = pointOpt.get();
            
            // 도메인 로직 사용 (검증 포함)
            point.deductPoints(amount, description);
            pointRepository.save(point);
            
            // 이벤트 발행
            PointsUsed pointsUsed = new PointsUsed(point);
            pointsUsed.publishAfterCommit();
            
            response.put("success", true);
            response.put("message", "포인트 사용이 완료되었습니다.");
            response.put("userId", userId);
            response.put("usedAmount", amount);
            response.put("remainingBalance", point.getPointBalance());
            response.put("point", point);
            
            logger.info("Point usage successful - userId: {}, remaining balance: {}", userId, point.getPointBalance());
            return ResponseEntity.ok(response);
            
        } catch (InsufficientPointsException | IllegalArgumentException e) {
            // 이미 GlobalExceptionHandler에서 처리되므로 재던짐
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during point usage: {}", e.getMessage(), e);
            throw new RuntimeException("포인트 사용 처리 중 시스템 오류가 발생했습니다.");
        }
    }

    /**
     * 사용자별 포인트 거래 내역 조회
     */
    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<Map<String, Object>> getUserTransactions(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<PointList> transactions = pointListRepository.findByUserId(userId);
            
            response.put("success", true);
            response.put("userId", userId);
            response.put("transactions", transactions);
            response.put("count", transactions.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "거래 내역 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 전체 포인트 계정 조회 (관리자용)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Map<String, Object>> getAllPoints() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Point> allPoints = (List<Point>) pointRepository.findAll();
            
            response.put("success", true);
            response.put("points", allPoints);
            response.put("count", allPoints.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "포인트 계정 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 포인트 환불
     */
    @PostMapping("/refund")
    public ResponseEntity<Map<String, Object>> refundPoints(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Integer amount = Integer.valueOf(request.get("amount").toString());
            String reason = request.getOrDefault("reason", "포인트 환불").toString();
            
            // 입력 검증
            if (userId == null || amount == null || amount <= 0) {
                response.put("success", false);
                response.put("error", "유효하지 않은 입력값입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<Point> pointOpt = pointRepository.findByUserId(userId);
            Point point;
            
            if (pointOpt.isPresent()) {
                point = pointOpt.get();
                point.setPointBalance(point.getPointBalance() + amount);
            } else {
                // 새 계정 생성
                point = new Point();
                point.setUserId(userId);
                point.setPointBalance(amount);
            }
            
            point.setTransactionType("REFUND");
            point.setTransactionAmount(amount);
            point.setDescription(reason);
            pointRepository.save(point);
            
            // 이벤트 발행
            PointsAdded pointsAdded = new PointsAdded(point);
            pointsAdded.publishAfterCommit();
            
            response.put("success", true);
            response.put("message", "포인트 환불이 완료되었습니다.");
            response.put("userId", userId);
            response.put("refundAmount", amount);
            response.put("newBalance", point.getPointBalance());
            response.put("point", point);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("error", "숫자 형식이 올바르지 않습니다.");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "포인트 환불 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
//>>> Clean Arch / Inbound Adaptor
