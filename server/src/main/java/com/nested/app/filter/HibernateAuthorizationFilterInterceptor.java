package com.nested.app.filter;

import com.nested.app.contect.UserContext;
import com.nested.app.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Component
@AllArgsConstructor
public class HibernateAuthorizationFilterInterceptor implements WebMvcConfigurer {
  private final EntityManager entityManager;
  private final UserContext userContext;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(
        new HandlerInterceptor() {
          @Override
          public boolean preHandle(
              @NonNull HttpServletRequest request,
              @NonNull HttpServletResponse response,
              @NonNull Object handler) {
            if (userContext.getUser() != null) {
              Session session = entityManager.unwrap(Session.class);
              var user = userContext.getUser();
              // Admin can see all data, other users can see only their own data
              if (Objects.equals(user.getRole(), User.Role.ADMIN)) {
                session.disableFilter("userFilter");
                return true;
              }
              session
                  .enableFilter("userFilter")
                  .setParameter("userId", userContext.getUser().getId());
            }
            return true;
          }
        });
  }
}
