package miniproject.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OpenAIConfig {

    private String apiKey;
    
    public OpenAIConfig() {
        // Load API key from .env file
        try {
            Dotenv dotenv = Dotenv.configure()
                .directory("src/main/resources")
                .filename(".env")
                .load();
            this.apiKey = dotenv.get("OPENAI_API_KEY");
            System.out.println("Loaded OpenAI API key from .env file: " + (apiKey != null ? "✓" : "✗"));
        } catch (Exception e) {
            System.err.println("Failed to load .env file: " + e.getMessage());
            this.apiKey = "sk-your-api-key-here";
        }
    }

    @Bean
    public RestTemplate openAIRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // Add Authorization header for all requests
        restTemplate.getInterceptors().add((ClientHttpRequestInterceptor) (request, body, execution) -> {
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
            request.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
            return execution.execute(request, body);
        });
        
        return restTemplate;
    }
    
    public boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.equals("sk-your-api-key-here") && apiKey.startsWith("sk-");
    }
    
    public String getApiKey() {
        return apiKey;
    }
}