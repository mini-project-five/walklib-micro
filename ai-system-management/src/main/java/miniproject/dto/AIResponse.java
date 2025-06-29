package miniproject.dto;

import lombok.Data;

@Data
public class AIResponse {
    private boolean success;
    private String message;
    private Object data;
    private String errorCode;
    
    public static AIResponse success(Object data) {
        AIResponse response = new AIResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setMessage("요청이 성공적으로 처리되었습니다.");
        return response;
    }
    
    public static AIResponse error(String message, String errorCode) {
        AIResponse response = new AIResponse();
        response.setSuccess(false);
        response.setMessage(message);
        response.setErrorCode(errorCode);
        return response;
    }
}
