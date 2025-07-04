package miniproject.domain;

import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
public class UserCreated extends AbstractEvent {

    private Long userId;
    private String email;
    private String userName;
    private String role;
    private String status;

    public UserCreated() {
        super();
    }

    public UserCreated(User user) {
        super(user);
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.userName = user.getUserName();
        this.role = user.getRole();
        this.status = user.getStatus();
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
//>>> DDD / Domain Event