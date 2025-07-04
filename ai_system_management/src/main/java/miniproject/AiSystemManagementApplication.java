package miniproject;

import io.github.cdimascio.dotenv.Dotenv;
import miniproject.config.kafka.KafkaProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
@EnableBinding(KafkaProcessor.class)
@EnableFeignClients
public class AiSystemManagementApplication {

    public static ApplicationContext applicationContext;

    public static void main(String[] args) {
        // Load .env file from parent directory
        try {
            Dotenv dotenv = Dotenv.configure()
                .directory("../") // Look for .env in parent directory
                .filename(".env")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();
            
            // Set system properties from .env
            String apiKey = dotenv.get("VITE_CHAT_API_KEY");
            if (apiKey != null && !apiKey.isEmpty()) {
                System.setProperty("OPENAI_API_KEY", apiKey);
                System.out.println("Successfully loaded OpenAI API key from .env file");
            } else {
                System.out.println("No OpenAI API key found in .env file");
            }
        } catch (Exception e) {
            System.out.println("Could not load .env file: " + e.getMessage());
        }
        
        applicationContext =
            SpringApplication.run(AiSystemManagementApplication.class, args);
    }
}
