package miniproject.infra;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 토큰 생성 및 검증 유틸리티
 */
@Component
public class JwtTokenUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);

    // JWT 비밀키 (프로덕션에서는 환경변수나 외부 설정으로 관리해야 함)
    @Value("${jwt.secret:walklib-super-secret-key-for-jwt-token-generation-and-validation}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}") // 24시간 (밀리초)
    private Long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * JWT 토큰 생성
     */
    public String generateToken(Long userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        
        return createToken(claims, email);
    }

    /**
     * 토큰 생성 헬퍼 메서드
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 토큰에서 사용자 이메일 추출
     */
    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * 토큰에서 사용자 ID 추출
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("userId", Long.class);
    }

    /**
     * 토큰에서 사용자 역할 추출
     */
    public String getRoleFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("role", String.class);
    }

    /**
     * 토큰 만료일 추출
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * 토큰에서 특정 클레임 추출
     */
    public <T> T getClaimFromToken(String token, ClaimsResolver<T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.resolve(claims);
    }

    /**
     * 토큰에서 모든 클레임 추출
     */
    private Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid JWT token", e);
        }
    }

    /**
     * 토큰 만료 여부 확인
     */
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * 토큰 유효성 검증
     */
    public Boolean validateToken(String token, String email) {
        try {
            final String tokenEmail = getEmailFromToken(token);
            return (tokenEmail.equals(email) && !isTokenExpired(token));
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰 유효성 검증 (이메일 검증 없이)
     */
    public Boolean validateToken(String token) {
        try {
            getAllClaimsFromToken(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Bearer 토큰에서 실제 토큰 추출
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    // 함수형 인터페이스
    @FunctionalInterface
    public interface ClaimsResolver<T> {
        T resolve(Claims claims);
    }
}