package com.nested.app.filter;

import com.nested.app.context.UserContext;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@AllArgsConstructor
@Slf4j
public class UserContextFilter extends OncePerRequestFilter {

  private final UserContext userContext;

  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;

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
            userContext.setUser(createUser(jwt));
          }
      }
    }

    filterChain.doFilter(request, response);
  }

  public User createUser(Jwt jwt) {
    var firebaseUid = jwt.getSubject();
    log.info("Starting user creation for firebaseUid={}", firebaseUid);

    var phoneNumber = jwt.getClaim("phone_number");
    if (phoneNumber == null && Objects.equals(jwt.getClaim("email"), "test-user@nested.money")) {
      phoneNumber = "+916382751234";
    }

    if (phoneNumber == null) {
      throw new IllegalArgumentException("Invalid phone number");
    }

    var user =
        User.builder()
            .firebaseUid(firebaseUid)
            .email(null)
            .phoneNumber(phoneNumber.toString())
            .firstName(jwt.getClaimAsString("name"))
            .investor(Investor.builder().build())
            .build();

    investorRepository.saveAndFlush(user.getInvestor());
    userRepository.save(user);
    return user;
  }
}
