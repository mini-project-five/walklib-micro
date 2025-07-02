package miniproject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * User Service 보안 설정
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // strength 12 for better security
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 개발 환경에서는 모든 출처 허용, 프로덕션에서는 특정 도메인만 허용해야 함
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // REST API이므로 CSRF 비활성화
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS) // JWT 사용으로 세션 비활성화
            .and()
            .authorizeRequests()
                // 공개 엔드포인트
                .antMatchers("/users/register", "/users/login").permitAll()
                .antMatchers("/actuator/**").permitAll() // 헬스체크용
                .antMatchers("/h2-console/**").permitAll() // 개발용 H2 콘솔
                
                // 관리자 전용 엔드포인트
                .antMatchers("/users/admin/**").hasRole("ADMIN")
                
                // 나머지는 인증 필요
                .anyRequest().authenticated()
            .and()
            .headers().frameOptions().disable(); // H2 콘솔용
    }
}