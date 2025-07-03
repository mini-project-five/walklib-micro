package miniproject;

import miniproject.config.kafka.KafkaProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.context.ApplicationContext;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration.class
})
@EnableBinding(KafkaProcessor.class)
@EnableFeignClients
public class UserManagementApplication {

    public static ApplicationContext applicationContext;

    public static void main(String[] args) {
        applicationContext =
            SpringApplication.run(UserManagementApplication.class, args);
    }
}
