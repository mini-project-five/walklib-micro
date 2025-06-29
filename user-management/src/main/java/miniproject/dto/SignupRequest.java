package miniproject.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String userName;
    private String email;
    private String password;
    private String confirmPassword;  // 비밀번호 확인
    private String realName;  // 실명
    private String penName;   // 필명
    private Boolean isKtCustomer = false;
    private String role = "USER";
    private String userType; // userType 필드 추가
    
    // userType getter가 없으면 role을 반환
    public String getUserType() {
        return userType != null ? userType : role;
    }
    
    // 역호환성을 위해 role getter도 userType을 확인
    public String getRole() {
        return userType != null ? userType : role;
    }
}
