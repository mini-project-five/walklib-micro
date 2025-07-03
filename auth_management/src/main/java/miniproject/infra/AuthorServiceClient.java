package miniproject.infra;

import miniproject.domain.LoginRequest;
import miniproject.domain.RegisterRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "author-service", url = "${author.service.url:http://walklib-author:8080}")
public interface AuthorServiceClient {
    
    @PostMapping("/authors/internal/register")
    Map<String, Object> registerAuthor(@RequestBody RegisterRequest request);
    
    @PostMapping("/authors/internal/login")
    Map<String, Object> loginAuthor(@RequestBody LoginRequest request);
}