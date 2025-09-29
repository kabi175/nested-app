package com.nested.app.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.nested.app.contect.UserContext;
import com.nested.app.entity.User;
import com.nested.app.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@AllArgsConstructor
public class UserContextFilter extends OncePerRequestFilter {
  private final UserContext userContext;

  private final UserRepository userRepository;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (!(auth instanceof AnonymousAuthenticationToken)) {
      Object principal = auth.getPrincipal(); // can be a UserDetails
      var user = userRepository.findByFirebaseUid(principal.toString());
      user.ifPresent(userContext::setUser);
      if (user.isEmpty()) {
        try {
          userContext.setUser(createUser(auth));
        } catch (FirebaseAuthException e) {
          throw new RuntimeException(e);
        }
      }
    }

    filterChain.doFilter(request, response);
  }

  User createUser(Authentication auth) throws FirebaseAuthException {
    var user = new User();
    UserRecord userRecord = FirebaseAuth.getInstance().getUser(auth.getPrincipal().toString());
    user.setFirebaseUid(auth.getPrincipal().toString());
    user.setEmail(userRecord.getEmail());
    user.setPhoneNumber(userRecord.getPhoneNumber());
    user.setName(userRecord.getDisplayName());

    userRepository.save(user);
    return user;
  }
}
