package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_activity_logs")
public class UserActivityLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id")
    private String userId;

    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private Role role;

    @Column(nullable = false, length = 1024)
    private String action;

    @Column(nullable = false)
    private String timestamp;

    private String ipAddress;

    public UserActivityLog() {}

    public UserActivityLog(String id, String userId, String userName, Role role, String action, String timestamp, String ipAddress) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.role = role;
        this.action = action;
        this.timestamp = timestamp;
        this.ipAddress = ipAddress;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
