package miniproject.domain.dto;

import lombok.Data;

@Data
public class AIResponse {
    private boolean success;
    private String message;
    private Object data;
    
    public static AIResponse success(Object data) {
        AIResponse response = new AIResponse();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }
    
    public static AIResponse error(String message) {
        AIResponse response = new AIResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}