package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.model.Product;
import com.thitiphatx.secondhand.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ShopService {
    private final ProductRepository productRepository;

    public Page<Product> getProducts() {
        Pageable pageable = PageRequest.of(0, 21);
        return productRepository.findAll(pageable);
    }

}
