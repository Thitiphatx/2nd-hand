package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.dto.AuthResponse;
import com.thitiphatx.secondhand.dto.LoginRequest;
import com.thitiphatx.secondhand.dto.RegisterRequest;
import com.thitiphatx.secondhand.helper.UserMapper;
import com.thitiphatx.secondhand.model.Role;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.repository.UserRepository;
import com.thitiphatx.secondhand.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User.UserBuilder userBuilder = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .phone(request.getPhone())
                .gender(request.getGender())
                .birth(request.getBirth())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true);

        User user = userRepository.save(userBuilder.build());
        String token = jwtService.generateToken(user);
        return userMapper.mapToAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            String token = jwtService.generateToken(user);
            return userMapper.mapToAuthResponse(user, token);
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        } catch (DisabledException e) {
            throw new RuntimeException("Your account is disabled. Please wait admin for approval.");
        } catch (LockedException e) {
            throw new RuntimeException("Your account is locked.");
        } catch (AuthenticationException e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }
}
