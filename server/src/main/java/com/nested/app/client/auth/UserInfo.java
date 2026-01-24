package com.nested.app.client.auth;

import lombok.Data;

@Data
public class UserInfo {
    private String name;
    private String email;
    private String phone_number;
    private String sub;
}
