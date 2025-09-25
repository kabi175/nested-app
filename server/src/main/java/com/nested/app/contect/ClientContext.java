package com.nested.app.contect;

import com.nested.app.entity.Investor;
import lombok.Data;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

@Data
@Component
@RequestScope
public class ClientContext {
    private Investor investor;
}
