package com.nested.app.events;

import com.nested.app.entity.User;

public record UserUpdateEvent(User oldUser, User newUser) {}
