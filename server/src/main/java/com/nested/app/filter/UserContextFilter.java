package com.nested.app.filter;

import com.nested.app.client.auth.UserInfoApi;
import com.nested.app.context.UserContext;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

@Component
@AllArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 100) // Run after TraceIdFilter
public class UserContextFilter extends OncePerRequestFilter {

  private final UserContext userContext;

  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;
  private final UserInfoApi userInfoApi;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (!(auth instanceof AnonymousAuthenticationToken)) {
      Object principal = auth.getPrincipal(); // can be a UserDetails
      if (principal instanceof Jwt jwt) {
        var userIdentifier = jwt.getSubject();
          var user = userRepository.findByFirebaseUid(userIdentifier);
          user.ifPresent(userContext::setUser);
          if (user.isEmpty()) {
          userContext.setUser(createUser(jwt, request));
          }
      }
    }

    filterChain.doFilter(request, response);
  }

  public User createUser(Jwt jwt, HttpServletRequest request) {
    var firebaseUid = jwt.getSubject();
    log.info("Starting user creation for firebaseUid={}", firebaseUid);

    var userInfo = userInfoApi.getUserInfo(request.getHeader(HttpHeaders.AUTHORIZATION)).block();

    var phoneNumber = jwt.getClaim("phone_number");
    if (phoneNumber == null && userInfo != null) {
      phoneNumber = userInfo.getPhone_number();
    }

    var email = jwt.getClaim("email");
    if (email == null && userInfo != null) {
      email = userInfo.getEmail();
    }

    var name = jwt.getClaim("name");
    if (name == null && userInfo != null) {
      name = userInfo.getName();
    }

    if (phoneNumber == null && Objects.equals(email, "test-user@nested.money")) {
      phoneNumber = "+916382751234";
    }

    if (phoneNumber == null) {
      throw new IllegalArgumentException("Invalid phone number");
    }

    if (name == null) {
      name = phoneNumber;
    }

    var user =
        User.builder()
            .firebaseUid(firebaseUid)
            .email(null)
            .phoneNumber(phoneNumber.toString())
            .firstName(name.toString())
            .investor(Investor.builder().build())
            .build();

    investorRepository.saveAndFlush(user.getInvestor());
    userRepository.save(user);
    return user;
  }
}
