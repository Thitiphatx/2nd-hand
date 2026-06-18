package com.thitiphatx.secondhand.helper;

import com.thitiphatx.secondhand.dto.AuthResponse;
import com.thitiphatx.secondhand.dto.UserResponse;
import com.thitiphatx.secondhand.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public AuthResponse mapToAuthResponse(User user) {
        return mapToAuthResponse(user, null);
    }

    public AuthResponse mapToAuthResponse(User user, String token) {
        if (user == null) {
            return null;
        }
        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .birth(user.getBirth())
                .roles(user.getRoles())
                .defaultAddressId(user.getDefaultAddressId())
                .enabled(user.isEnabled())
                .token(token)
                .build();
    }

    public UserResponse mapToUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .birth(user.getBirth())
                .roles(user.getRoles())
                .defaultAddressId(user.getDefaultAddressId())
                .enabled(user.isEnabled())
                .build();
    }
}
