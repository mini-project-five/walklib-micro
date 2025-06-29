package miniproject.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class JwtGlobalFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtils jwtUtils;

    // JWT 검증을 건너뛸 경로들
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
        "/users/auth/signup",
        "/users/auth/login",
        "/auth/signup",
        "/auth/login",
        "/actuator/health",
        "/actuator"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        System.out.println("Gateway Filter - Method: " + request.getMethod() + ", Path: " + path);
        System.out.println("Headers: " + request.getHeaders().toSingleValueMap());

        // 임시로 모든 요청을 통과시킴 (JWT 검증 비활성화)
        System.out.println("JWT validation temporarily disabled - allowing all requests");
        return chain.filter(exchange);

        /*
        // 제외 경로인지 확인
        boolean isExcluded = EXCLUDED_PATHS.stream()
            .anyMatch(excludedPath -> {
                boolean matches = path.startsWith(excludedPath) || path.equals(excludedPath);
                System.out.println("Checking path '" + path + "' against '" + excludedPath + "' = " + matches);
                return matches;
            });

        if (isExcluded) {
            System.out.println("Path excluded from JWT validation: " + path);
            return chain.filter(exchange);
        }

        // Authorization 헤더 확인
        String authHeader = request.getHeaders().getFirst("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No Authorization header or invalid format");
            return handleUnauthorized(exchange);
        }

        String token = authHeader.substring(7);
        System.out.println("JWT Token: " + token.substring(0, 50) + "...");
        
        // JWT 토큰 검증
        boolean isValid = jwtUtils.validateToken(token);
        boolean isExpired = jwtUtils.isTokenExpired(token);
        
        System.out.println("Token valid: " + isValid + ", expired: " + isExpired);
        
        if (!isValid || isExpired) {
            System.out.println("JWT validation failed");
            return handleUnauthorized(exchange);
        }

        // 사용자 정보를 헤더에 추가 (선택적)
        String username = jwtUtils.getUsernameFromToken(token);
        if (username != null) {
            System.out.println("User from token: " + username);
            ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Email", username)
                .build();
            exchange = exchange.mutate().request(modifiedRequest).build();
        }

        System.out.println("JWT validation passed, proceeding to service");
        return chain.filter(exchange);
        */
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -100; // 매우 높은 우선순위로 변경
    }
}
