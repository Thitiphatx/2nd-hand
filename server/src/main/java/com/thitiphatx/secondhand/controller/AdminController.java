package com.thitiphatx.secondhand.controller;

import com.thitiphatx.secondhand.dto.AdminStatsResponse;
import com.thitiphatx.secondhand.dto.UserResponse;
import com.thitiphatx.secondhand.helper.UserMapper;
import com.thitiphatx.secondhand.model.Order;
import com.thitiphatx.secondhand.model.Product;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserMapper userMapper;

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers(@RequestParam(required = false) String search) {
        return adminService.getAllUsers(search).stream()
                .map(userMapper::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@RequestBody User user) {
        User created = adminService.createUser(user);
        return userMapper.mapToUserResponse(created);
    }

    @PutMapping("/users/{userId}")
    public UserResponse updateUser(@PathVariable String userId, @RequestBody User user) {
        User updated = adminService.updateUser(userId, user);
        return userMapper.mapToUserResponse(updated);
    }

    @DeleteMapping("/users/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
    }

//    @PutMapping("/users/{userId}/approve")
//    public UserResponse approveUser(@PathVariable String userId) {
//        // Keeps backwards compatibility for existing endpoint structure
//        User user = adminService.getAllUsers().stream()
//                .filter(u -> u.getId().equals(userId))
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        user.setEnabled(true);
//        User updated = adminService.updateUser(userId, user);
//        return userMapper.mapToUserResponse(updated);
//    }

    @GetMapping("/products")
    public List<Product> getAllProducts(@RequestParam(required = false) String state,
                                        @RequestParam(required = false) String sort) {
        return adminService.getAllProducts(state, sort);
    }

    @PutMapping("/products/{productId}/approve")
    public Product approveProduct(@PathVariable String productId) {
        return adminService.approveProduct(productId);
    }

    @PutMapping("/products/{productId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rejectProduct(@PathVariable String productId) {
        adminService.rejectProduct(productId);
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders(@RequestParam(required = false) String status) {
        return adminService.getAllOrders(status);
    }
}
