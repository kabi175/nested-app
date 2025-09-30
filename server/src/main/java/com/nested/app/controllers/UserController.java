package com.nested.app.controllers;

import com.nested.app.dto.Entity;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.User;
import com.nested.app.services.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Validated
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

  private final UserService userService;

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Entity<UserDTO>> getUsers(
      @RequestParam UserService.Type type, @PageableDefault(sort = "id") Pageable pageable) {
    var users = userService.findAllUsers(type, pageable);
    if (users.isEmpty()) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(Entity.of(users));
  }

  @PatchMapping
  public ResponseEntity<User> updateUser() {
    User user = new User();
    user.setId(1L);
    user.setName("John Doe");
    return ResponseEntity.ok(user);
  }
}
