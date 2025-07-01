package miniproject.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String refineText(String originalText, String genre, String style, String targetAudience, String instructions) {
        try {
            String prompt = buildTextRefinementPrompt(originalText, genre, style, targetAudience, instructions);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "당신은 전문적인 텍스트 편집자입니다. 주어진 텍스트를 더 매력적이고 읽기 쉽게 다듬어주세요."),
                Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("max_tokens", 2000);
            requestBody.put("temperature", 0.7);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl + "/chat/completions",
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            
            throw new RuntimeException("OpenAI API 응답이 예상과 다릅니다.");
            
        } catch (Exception e) {
            log.error("텍스트 다듬기 중 오류 발생: ", e);
            throw new RuntimeException("텍스트 다듬기 실패: " + e.getMessage());
        }
    }

    public String generateCoverImage(String title, String author, String genre, String mood, String style, String colorScheme, String description) {
        try {
            String prompt = buildCoverPrompt(title, author, genre, mood, style, colorScheme, description);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "dall-e-3");
            requestBody.put("prompt", prompt);
            requestBody.put("n", 1);
            requestBody.put("size", "1024x1024");
            requestBody.put("quality", "standard");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl + "/images/generations",
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseBody.get("data");
                if (data != null && !data.isEmpty()) {
                    return (String) data.get(0).get("url");
                }
            }
            
            throw new RuntimeException("OpenAI DALL-E API 응답이 예상과 다릅니다.");
            
        } catch (Exception e) {
            log.error("표지 이미지 생성 중 오류 발생: ", e);
            throw new RuntimeException("표지 이미지 생성 실패: " + e.getMessage());
        }
    }

    private String buildTextRefinementPrompt(String originalText, String genre, String style, String targetAudience, String instructions) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("다음 텍스트를 다듬어주세요:\n\n");
        prompt.append("원본 텍스트: ").append(originalText).append("\n\n");
        
        if (genre != null && !genre.trim().isEmpty()) {
            prompt.append("장르: ").append(genre).append("\n");
        }
        if (style != null && !style.trim().isEmpty()) {
            prompt.append("스타일: ").append(style).append("\n");
        }
        if (targetAudience != null && !targetAudience.trim().isEmpty()) {
            prompt.append("대상 독자: ").append(targetAudience).append("\n");
        }
        if (instructions != null && !instructions.trim().isEmpty()) {
            prompt.append("추가 지시사항: ").append(instructions).append("\n");
        }
        
        prompt.append("\n다듬어진 텍스트만 응답으로 제공해주세요. 설명이나 주석은 불필요합니다.");
        
        return prompt.toString();
    }

    private String buildCoverPrompt(String title, String author, String genre, String mood, String style, String colorScheme, String description) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a professional book cover design for: \n");
        prompt.append("Title: ").append(title).append("\n");
        prompt.append("Author: ").append(author).append("\n");
        
        if (genre != null && !genre.trim().isEmpty()) {
            prompt.append("Genre: ").append(genre).append("\n");
        }
        if (mood != null && !mood.trim().isEmpty()) {
            prompt.append("Mood: ").append(mood).append("\n");
        }
        if (style != null && !style.trim().isEmpty()) {
            prompt.append("Style: ").append(style).append("\n");
        }
        if (colorScheme != null && !colorScheme.trim().isEmpty()) {
            prompt.append("Color scheme: ").append(colorScheme).append("\n");
        }
        if (description != null && !description.trim().isEmpty()) {
            prompt.append("Book description: ").append(description).append("\n");
        }
        
        prompt.append("The cover should be modern, eye-catching, and suitable for publication. Include the title and author name prominently.");
        
        return prompt.toString();
    }
}
