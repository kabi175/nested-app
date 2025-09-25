package com.nested.app.controllers;

import com.nested.app.dto.Entity;
import com.nested.app.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @GetMapping
    public ResponseEntity<Entity<User>> getUsers(@RequestParam String type) {
        return ResponseEntity.noContent().build();
    }

    @PatchMapping
    public ResponseEntity<User> updateUser() {
        User user = new User();
        user.setId(1L);
        user.setNickname("John Doe");
        return ResponseEntity.ok(user);
    }
}
