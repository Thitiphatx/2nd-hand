package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.dto.AdminStatsResponse;
import com.thitiphatx.secondhand.model.*;
import com.thitiphatx.secondhand.repository.OrderRepository;
import com.thitiphatx.secondhand.repository.ProductRepository;
import com.thitiphatx.secondhand.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.thitiphatx.secondhand.model.ProductState;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStatsResponse getStats() {
        List<Order> allOrders = orderRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        List<Product> allProducts = productRepository.findAll();

        long totalUsers = allUsers.size();
        long totalProducts = allProducts.size();
        long totalOrders = allOrders.size();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.PAY_WAITING && o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Revenue trend for last 7 days
        List<AdminStatsResponse.ChartDataPoint> revenueTrend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal dailySum = allOrders.stream()
                    .filter(o -> o.getPurchasedDate() != null && o.getPurchasedDate().toLocalDate().equals(date))
                    .filter(o -> o.getStatus() != OrderStatus.PAY_WAITING && o.getStatus() != OrderStatus.CANCELLED)
                    .map(Order::getTotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            revenueTrend.add(new AdminStatsResponse.ChartDataPoint(date.toString(), dailySum.doubleValue()));
        }

        // User registration trend for last 7 days
        List<AdminStatsResponse.ChartDataPoint> userTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long count = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().toLocalDate().equals(date))
                    .count();

            userTrend.add(new AdminStatsResponse.ChartDataPoint(date.toString(), (double) count));
        }

        // Product tags distribution
        Map<String, Long> tagCounts = allProducts.stream()
                .filter(p -> p.getTags() != null)
                .flatMap(p -> p.getTags().stream())
                .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));

        List<AdminStatsResponse.ChartDataPoint> tagDistribution = tagCounts.entrySet().stream()
                .map(entry -> new AdminStatsResponse.ChartDataPoint(entry.getKey(), entry.getValue().doubleValue()))
                .collect(Collectors.toList());

        // Order status distribution
        Map<OrderStatus, Long> statusCounts = allOrders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        List<AdminStatsResponse.ChartDataPoint> statusDistribution = new ArrayList<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = statusCounts.getOrDefault(status, 0L);
            statusDistribution.add(new AdminStatsResponse.ChartDataPoint(status.name(), (double) count));
        }

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .revenueTrend(revenueTrend)
                .userRegistrationTrend(userTrend)
                .productTagDistribution(tagDistribution)
                .orderStatusDistribution(statusDistribution)
                .build();
    }

    public List<User> getAllUsers(String search) {
        if (search != null && !search.isBlank()) {
            return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search);
        }
        return userRepository.findAll();
    }

    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(new ArrayList<>(List.of(Role.USER)));
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public User updateUser(String userId, User updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(updateRequest.getName());
        user.setEmail(updateRequest.getEmail());
        user.setPhone(updateRequest.getPhone());
        user.setGender(updateRequest.getGender());
        user.setBirth(updateRequest.getBirth());
        user.setRoles(updateRequest.getRoles());
        user.setEnabled(updateRequest.isEnabled());
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }
        return userRepository.save(user);
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    public List<Product> getAllProducts(String state, String sortStr) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if (sortStr != null && !sortStr.isBlank()) {
            String[] parts = sortStr.split("_");
            if (parts.length == 2) {
                String field = parts[0];
                String direction = parts[1];
                org.springframework.data.domain.Sort.Direction dir = direction.equalsIgnoreCase("desc") ?
                        org.springframework.data.domain.Sort.Direction.DESC :
                        org.springframework.data.domain.Sort.Direction.ASC;
                if (field.equals("price") || field.equals("name")) {
                    sort = org.springframework.data.domain.Sort.by(dir, field);
                }
            }
        }

        if (state != null && !state.isBlank()) {
            try {
                return productRepository.findByState(ProductState.valueOf(state), sort);
            } catch (IllegalArgumentException ignored) {
                // fall through to return all
            }
        }
        return productRepository.findAll(sort);
    }

    public Product approveProduct(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setState(ProductState.LISTED);
        return productRepository.save(product);
    }

    public void rejectProduct(String productId) {
        productRepository.deleteById(productId);
    }

    public List<Order> getAllOrders(String status) {
        if (status != null && !status.isBlank()) {
            try {
                return orderRepository.findByStatus(OrderStatus.valueOf(status));
            } catch (IllegalArgumentException ignored) {
                // fall through to return all
            }
        }
        return orderRepository.findAll();
    }
}
