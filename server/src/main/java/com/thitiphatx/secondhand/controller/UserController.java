package com.thitiphatx.secondhand.controller;


import com.thitiphatx.secondhand.dto.ChangePasswordRequest;
import com.thitiphatx.secondhand.dto.AddressRequest;
import com.thitiphatx.secondhand.dto.UpdaterUserRequest;
import com.thitiphatx.secondhand.dto.UserPublicInfoResponse;
import com.thitiphatx.secondhand.dto.UserResponse;
import com.thitiphatx.secondhand.model.Address;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Page<User> getUser() {
        return userService.getUser();
    }

    @GetMapping("{id}")
    @ResponseStatus(HttpStatus.OK)
    public UserResponse getUserDetail(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        return userService.getUserDetail(id, user);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdaterUserRequest request,
            @AuthenticationPrincipal User user
    ) {
        return userService.updateUser(id, request, user);
    }

    @PutMapping("/{id}/change-password")
    public void changePassword(
            @PathVariable String id,
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User user
    ) {
        userService.changePassword(id, request, user);
    }

    @PostMapping("/addresses")
    public Address createAddress(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal User user
    ) {
        return userService.createAddress(request, user);
    }

    @GetMapping("/addresses")
    public List<Address> getAddresses(@AuthenticationPrincipal User user) {
        return userService.getAddresses(user);
    }

    @PutMapping("/addresses/{addressId}")
    public Address updateAddress(
            @PathVariable String addressId,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal User user
    ) {
        return userService.updateAddress(addressId, request, user);
    }

    @DeleteMapping("/addresses/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(
            @PathVariable String addressId,
            @AuthenticationPrincipal User user
    ) {
        userService.deleteAddress(addressId, user);
    }

    @PutMapping("/addresses/{addressId}/default")
    public Address updateDefaultAddress(
            @PathVariable String addressId,
            @AuthenticationPrincipal User user
    ) {
        return userService.updateDefaultAddress(addressId, user);
    }

    @GetMapping("/{id}/public")
    @ResponseStatus(HttpStatus.OK)
    public UserPublicInfoResponse getUserPublicInfo(@PathVariable String id) {
        return userService.getUserPublicInfo(id);
    }
}
