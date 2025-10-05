package com.nested.app.controllers;

import com.nested.app.dto.Entity;
import com.nested.app.dto.UserDTO;
import com.nested.app.services.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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

  @PatchMapping(
      path = "/{id}",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<UserDTO> updateUser(
      @PathVariable Long id,
      @Validated @org.springframework.web.bind.annotation.RequestBody UserDTO userDTO) {
    userDTO.setId(id.toString());
    UserDTO updatedUser = userService.updateUser(userDTO);
    return ResponseEntity.ok(updatedUser);
  }
}
