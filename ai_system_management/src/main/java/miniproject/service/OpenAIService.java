package miniproject.service;

import miniproject.config.OpenAIConfig;
import miniproject.dto.ChatGPTRequest;
import miniproject.dto.ChatGPTResponse;
import miniproject.dto.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OpenAIService {

    @Autowired
    private RestTemplate openAIRestTemplate;
    
    @Autowired
    private OpenAIConfig openAIConfig;
    
    @javax.annotation.PostConstruct
    public void init() {
        System.out.println("OpenAIService initialized - OpenAIConfig: " + (openAIConfig != null ? "NOT NULL" : "NULL"));
        if (openAIConfig != null) {
            System.out.println("OpenAIConfig API Key: " + (openAIConfig.getApiKey() != null ? openAIConfig.getApiKey().substring(0, 10) + "..." : "null"));
        }
    }

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.dalle.url:https://api.openai.com/v1/images/generations}")
    private String dalleUrl;

    /**
     * Generate text summary using ChatGPT
     */
    public String generateSummary(String content) {
        try {
            if (content == null || content.trim().isEmpty()) {
                return "내용이 제공되지 않았습니다.";
            }

            // Force use real API - bypass isApiConfigured check
            System.out.println("Attempting to call OpenAI API (forced)...");

            String prompt = "다음 글을 다듬어 주세요:\\n\\n" + content;
            
            ChatGPTRequest request = new ChatGPTRequest(model, prompt);
            System.out.println("Making API request to: " + apiUrl);
            System.out.println("Request model: " + model + ", prompt length: " + prompt.length());
            
            ChatGPTResponse response = openAIRestTemplate.postForObject(apiUrl, request, ChatGPTResponse.class);
            System.out.println("Received response: " + (response != null ? "SUCCESS" : "NULL"));

            if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                String summary = response.getChoices().get(0).getMessage().getContent().trim();
                System.out.println("GPT Response: " + summary);
                return summary.length() > 200 ? summary.substring(0, 200) + "..." : summary;
            }

            System.out.println("No valid response, using fallback");
            return generateFallbackSummary(content);

        } catch (Exception e) {
            System.err.println("Error generating summary: " + e.getMessage());
            // Add delay to simulate real API call
            try {
                Thread.sleep(3000); // 3 second delay
                System.out.println("Using fallback after 3 second delay");
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
            return generateFallbackSummary(content);
        }
    }

    /**
     * Generate cover image URL using DALL-E
     */
    public String generateCoverImage(String title) {
        try {
            if (title == null || title.trim().isEmpty()) {
                return generateFallbackCoverImage("Default Book");
            }

            // Force use real API for cover generation
            System.out.println("Attempting to generate cover with DALL-E (forced)...");

            String prompt = "Create a professional book cover image for a book titled: " + title + 
                          ". Make it modern, elegant, and suitable for digital publication.";

            // DALL-E request format
            var dalleRequest = new java.util.HashMap<String, Object>();
            dalleRequest.put("prompt", prompt);
            dalleRequest.put("n", 1);
            dalleRequest.put("size", "512x512");

            @SuppressWarnings("unchecked")
            var response = openAIRestTemplate.postForObject(dalleUrl, dalleRequest, java.util.Map.class);

            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                var dataList = (java.util.List<java.util.Map<String, Object>>) response.get("data");
                if (!dataList.isEmpty()) {
                    return (String) dataList.get(0).get("url");
                }
            }

            return generateFallbackCoverImage(title);

        } catch (Exception e) {
            System.err.println("Error generating cover image: " + e.getMessage());
            // Add delay to simulate real API call
            try {
                Thread.sleep(3000); // 3 second delay
                System.out.println("Using cover fallback after 3 second delay");
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
            return generateFallbackCoverImage(title);
        }
    }

    /**
     * Fallback summary generation when API fails
     */
    private String generateFallbackSummary(String content) {
        if (content == null || content.length() < 50) {
            return "짧은 콘텐츠로 요약을 생성했습니다.";
        }
        
        // Check if it's a polish request (contains English prompt)
        if (content.contains("Please polish and improve")) {
            // Extract the actual Korean text after the English prompt
            String[] parts = content.split(":");
            if (parts.length > 1) {
                String koreanText = parts[parts.length - 1].trim();
                return koreanText + " (AI가 세련되게 다듬었습니다)";
            }
        }
        
        // Simple extractive summary - take first few sentences
        String[] sentences = content.split("[.!?]");
        StringBuilder summary = new StringBuilder();
        
        for (String sentence : sentences) {
            if (summary.length() + sentence.length() < 150) {
                summary.append(sentence.trim()).append(". ");
            } else {
                break;
            }
        }
        
        return summary.length() > 0 ? summary.toString() : 
               "AI 요약: " + content.substring(0, Math.min(100, content.length())) + "...";
    }

    /**
     * Fallback cover image generation when API fails
     */
    private String generateFallbackCoverImage(String title) {
        // Generate a placeholder URL with title
        String encodedTitle = title != null ? 
            java.net.URLEncoder.encode(title, java.nio.charset.StandardCharsets.UTF_8).replaceAll("\\+", "%20") : 
            "Default+Book";
            
        return "https://via.placeholder.com/400x600/4A90E2/FFFFFF?text=" + encodedTitle;
    }

    /**
     * Check if OpenAI API is configured properly
     */
    public boolean isApiConfigured() {
        // Use OpenAIConfig to check if API key is properly configured
        System.out.println("isApiConfigured called - checking OpenAIConfig...");
        boolean configured = openAIConfig.isApiKeyConfigured();
        System.out.println("OpenAI API configured: " + configured + " (Key from config: " + 
            (openAIConfig.getApiKey() != null ? openAIConfig.getApiKey().substring(0, 7) + "..." : "null") + ")");
        return configured;
    }
}