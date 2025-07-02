package miniproject.infra;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Subscription Service 전역 예외 처리기
 */
@RestControllerAdvice
public class SubscriptionExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionExceptionHandler.class);

    /**
     * 구독 관련 비즈니스 로직 예외 처리
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException e) {
        logger.warn("Business rule violation: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", e.getMessage());
        response.put("errorType", "BUSINESS_RULE_VIOLATION");
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * 입력값 검증 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        logger.warn("Validation error: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", e.getMessage());
        response.put("errorType", "VALIDATION_ERROR");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * 데이터 변환 오류 처리
     */
    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<Map<String, Object>> handleNumberFormatException(NumberFormatException e) {
        logger.warn("Number format error: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "유효하지 않은 숫자 형식입니다.");
        response.put("errorType", "FORMAT_ERROR");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * 일반적인 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e) {
        logger.error("Unexpected error occurred: {}", e.getMessage(), e);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        response.put("errorType", "SYSTEM_ERROR");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * 구독 관련 사용자 정의 예외들
     */
    public static class SubscriptionNotFoundException extends RuntimeException {
        public SubscriptionNotFoundException(String message) {
            super(message);
        }
    }

    public static class InsufficientPointsException extends RuntimeException {
        public InsufficientPointsException(String message) {
            super(message);
        }
    }

    public static class SubscriptionAlreadyExistsException extends RuntimeException {
        public SubscriptionAlreadyExistsException(String message) {
            super(message);
        }
    }

    @ExceptionHandler(SubscriptionNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleSubscriptionNotFoundException(SubscriptionNotFoundException e) {
        logger.warn("Subscription not found: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", e.getMessage());
        response.put("errorType", "SUBSCRIPTION_NOT_FOUND");
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(InsufficientPointsException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientPointsException(InsufficientPointsException e) {
        logger.warn("Insufficient points: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", e.getMessage());
        response.put("errorType", "INSUFFICIENT_POINTS");
        
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
    }

    @ExceptionHandler(SubscriptionAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleSubscriptionAlreadyExistsException(SubscriptionAlreadyExistsException e) {
        logger.warn("Subscription already exists: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", e.getMessage());
        response.put("errorType", "SUBSCRIPTION_ALREADY_EXISTS");
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
}