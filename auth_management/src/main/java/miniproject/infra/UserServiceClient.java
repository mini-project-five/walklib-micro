package miniproject.infra;

import miniproject.domain.LoginRequest;
import miniproject.domain.RegisterRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "user-service", url = "${user.service.url:http://walklib-user:8080}")
public interface UserServiceClient {
    
    @PostMapping("/users/internal/register")
    Map<String, Object> registerUser(@RequestBody RegisterRequest request);
    
    @PostMapping("/users/internal/login")
    Map<String, Object> loginUser(@RequestBody LoginRequest request);
}