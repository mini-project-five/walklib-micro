package miniproject.domain.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@Service
public class OpenAIService {
    
    @Value("${openai.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    private final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    
    public OpenAIService() {
        this.restTemplate = new RestTemplate();
    }
    
    public String polishText(String content) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "AI 기능을 사용하려면 OpenAI API 키가 필요합니다. [Mock] 다듬어진 내용: " + content;
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("max_tokens", 1000);
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", "다음 웹소설 내용을 더 매력적이고 읽기 쉽게 다듬어주세요: " + content);
            messages.add(message);
            requestBody.put("messages", messages);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_API_URL, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> messageContent = (Map<String, String>) choice.get("message");
                    return messageContent.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("OpenAI API 호출 실패: " + e.getMessage());
        }
        
        return "[Mock] 다듬어진 내용: " + content;
    }
    
    public String generateCoverImage(String title, String genre, String description) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "https://via.placeholder.com/400x600?text=" + title.replace(" ", "+");
        }
        
        // DALL-E API 호출 구현 (간단한 mock 응답)
        return "https://via.placeholder.com/400x600?text=" + title.replace(" ", "+") + "+" + genre;
    }
    
    public String suggestPlot(String genre, String keywords) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "[Mock] " + genre + " 장르의 플롯 제안: " + keywords + "를 중심으로 한 흥미진진한 이야기";
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("max_tokens", 500);
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", genre + " 장르의 웹소설 플롯을 제안해주세요. 키워드: " + keywords);
            messages.add(message);
            requestBody.put("messages", messages);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_API_URL, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> messageContent = (Map<String, String>) choice.get("message");
                    return messageContent.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("OpenAI API 호출 실패: " + e.getMessage());
        }
        
        return "[Mock] " + genre + " 장르의 플롯 제안: " + keywords + "를 중심으로 한 흥미진진한 이야기";
    }
}