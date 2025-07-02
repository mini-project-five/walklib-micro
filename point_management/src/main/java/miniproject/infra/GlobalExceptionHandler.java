package miniproject.infra;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Point Service 글로벌 예외 처리기
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 비즈니스 규칙 위반 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.warn("Business rule violation: {}", ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        response.put("errorType", "BUSINESS_RULE_VIOLATION");
        
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * 숫자 형식 오류 예외 처리
     */
    @ExceptionHandler(NumberFormatException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleNumberFormatException(NumberFormatException ex) {
        logger.warn("Number format error: {}", ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "입력된 숫자 형식이 올바르지 않습니다.");
        response.put("errorType", "INVALID_NUMBER_FORMAT");
        
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * 메서드 인자 타입 불일치 예외 처리
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        logger.warn("Method argument type mismatch: {} for parameter: {}", ex.getValue(), ex.getName());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", String.format("파라미터 '%s'의 값 '%s'이 올바르지 않습니다.", ex.getName(), ex.getValue()));
        response.put("errorType", "INVALID_PARAMETER");
        
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * 포인트 부족 예외 처리
     */
    @ExceptionHandler(InsufficientPointsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, Object>> handleInsufficientPointsException(InsufficientPointsException ex) {
        logger.warn("Insufficient points: {}", ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        response.put("errorType", "INSUFFICIENT_POINTS");
        response.put("required", ex.getRequiredAmount());
        response.put("available", ex.getAvailableAmount());
        
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * 포인트 계정 없음 예외 처리
     */
    @ExceptionHandler(PointAccountNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<Map<String, Object>> handlePointAccountNotFoundException(PointAccountNotFoundException ex) {
        logger.warn("Point account not found: {}", ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", ex.getMessage());
        response.put("errorType", "POINT_ACCOUNT_NOT_FOUND");
        response.put("userId", ex.getUserId());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * 일반적인 런타임 예외 처리
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        logger.error("Runtime exception occurred: {}", ex.getMessage(), ex);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        response.put("errorType", "SYSTEM_ERROR");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * 모든 예외의 최종 처리기
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        logger.error("Unexpected exception occurred: {}", ex.getMessage(), ex);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "예상치 못한 오류가 발생했습니다. 관리자에게 문의하세요.");
        response.put("errorType", "UNEXPECTED_ERROR");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // 커스텀 예외 클래스들
    public static class InsufficientPointsException extends RuntimeException {
        private final Integer requiredAmount;
        private final Integer availableAmount;

        public InsufficientPointsException(String message, Integer requiredAmount, Integer availableAmount) {
            super(message);
            this.requiredAmount = requiredAmount;
            this.availableAmount = availableAmount;
        }

        public Integer getRequiredAmount() {
            return requiredAmount;
        }

        public Integer getAvailableAmount() {
            return availableAmount;
        }
    }

    public static class PointAccountNotFoundException extends RuntimeException {
        private final Long userId;

        public PointAccountNotFoundException(String message, Long userId) {
            super(message);
            this.userId = userId;
        }

        public Long getUserId() {
            return userId;
        }
    }
}