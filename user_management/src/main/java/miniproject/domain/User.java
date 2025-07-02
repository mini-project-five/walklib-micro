package miniproject.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import miniproject.UserManagementApplication;

@Entity
@Table(name = "User_table")
@Data
//<<< DDD / Aggregate Root
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long userId;

    private String email;

    private String userPassword;

    private String userName;

    private String userType; // 'reader' 또는 'author'

    private Integer coins; // 독자의 코인 보유량

    private Boolean isSubscribed; // 구독 여부

    private Boolean isKtCustomer;

    private String role;

    public static UserRepository repository() {
        UserRepository userRepository = UserManagementApplication.applicationContext.getBean(
            UserRepository.class
        );
        return userRepository;
    }
}
//>>> DDD / Aggregate Root
