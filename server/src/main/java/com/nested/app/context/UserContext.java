package com.nested.app.context;

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
