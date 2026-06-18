package com.thitiphatx.secondhand.controller;

import com.thitiphatx.secondhand.dto.AuthResponse;
import com.thitiphatx.secondhand.dto.LoginRequest;
import com.thitiphatx.secondhand.dto.RegisterRequest;
import com.thitiphatx.secondhand.service.AuthService;
import com.thitiphatx.secondhand.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
