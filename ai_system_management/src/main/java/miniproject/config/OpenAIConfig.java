package miniproject.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;
import javax.annotation.PostConstruct;

@Configuration
public class OpenAIConfig {

    @Value("${openai.api.key:}")
    private String configApiKey;
    
    private String apiKey;
    
    @javax.annotation.PostConstruct
    public void init() {
        System.out.println("OpenAIConfig PostConstruct initialization!");
        
        // Try environment variable first
        this.apiKey = System.getenv("OPENAI_API_KEY");
        
        // If not found, try Spring property
        if (this.apiKey == null || this.apiKey.isEmpty()) {
            this.apiKey = configApiKey;
        }
        
        // Log the result
        if (this.apiKey != null && !this.apiKey.isEmpty()) {
            System.out.println("OpenAI API Key configured: " + this.apiKey.substring(0, Math.min(10, this.apiKey.length())) + "...");
        } else {
            System.out.println("WARNING: OpenAI API Key not configured. AI features will use fallback mode.");
        }
    }

    @Bean
    public RestTemplate openAIRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // Add Authorization header for all requests using configured API key
        restTemplate.getInterceptors().add((ClientHttpRequestInterceptor) (request, body, execution) -> {
            if (apiKey != null && !apiKey.isEmpty()) {
                request.getHeaders().add(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
                request.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
                System.out.println("Setting Authorization header with key: " + apiKey.substring(0, Math.min(10, apiKey.length())) + "...");
            } else {
                System.out.println("WARNING: No API key available for OpenAI request");
            }
            return execution.execute(request, body);
        });
        
        return restTemplate;
    }
    
    public boolean isApiKeyConfigured() {
        boolean configured = apiKey != null && !apiKey.isEmpty() && 
                           (apiKey.startsWith("sk-proj-") || apiKey.startsWith("sk-")) && 
                           apiKey.length() > 20;
        System.out.println("API Key validation - Configured: " + configured + 
                         ", Length: " + (apiKey != null ? apiKey.length() : 0));
        return configured;
    }
    
    public String getApiKey() {
        return apiKey;
    }
}