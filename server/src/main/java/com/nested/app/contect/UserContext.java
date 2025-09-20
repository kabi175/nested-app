package com.nested.app.contect;

import com.nested.app.entity.Client;
import com.nested.app.entity.User;
import lombok.Data;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

@Data
@Component
@RequestScope
public class UserContext {
    private User user;
}
