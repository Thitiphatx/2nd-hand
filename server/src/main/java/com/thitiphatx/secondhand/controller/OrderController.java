package com.thitiphatx.secondhand.controller;

import com.thitiphatx.secondhand.dto.CreateOrderRequest;
import com.thitiphatx.secondhand.dto.OrderRequest;
import com.thitiphatx.secondhand.dto.UpdateOrderStatusRequest;
import com.thitiphatx.secondhand.model.Order;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("purchase")
    public Page<Order> getMyPurchasedOrders(
            @ModelAttribute OrderRequest request,
            Pageable pageable,
            @AuthenticationPrincipal User user) {
        return orderService.getMyPurchasedOrders(request, pageable, user);
    }

    @GetMapping("shop")
    public Page<Order> getShopOrders(
            @ModelAttribute OrderRequest request,
            Pageable pageable,
            @AuthenticationPrincipal User user
    ) {
        return orderService.getShopOrders(request, pageable, user);
    }

    @PutMapping("{id}")
    public void updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal User user
    ) {
        orderService.updateOrderStatus(id, request, user);
    }

    @GetMapping("{id}")
    public Order getOrderDetail(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        return orderService.getOrderDetail(id, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request, @AuthenticationPrincipal User user) {
        return orderService.createOrder(request, user);
    }

    @DeleteMapping("{id}")
    public void cancelOrder(
            @PathVariable String id,
            @RequestParam(required = false) String refundEmail,
            @AuthenticationPrincipal User user
    ) {
        orderService.cancelOrder(id, refundEmail, user);
    }
}
