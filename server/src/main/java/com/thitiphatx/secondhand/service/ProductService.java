package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.dto.*;
import com.thitiphatx.secondhand.helper.ProductMapper;
import com.thitiphatx.secondhand.model.*;
import com.thitiphatx.secondhand.repository.ProductRepository;
import com.thitiphatx.secondhand.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final MongoTemplate mongoTemplate;
    private final ProductMapper productMapper;
    private final FileService fileService;

    public Page<ProductResultResponse> searchProducts(ProductRequest request, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        if (request.getShopkeeper() != null && !request.getShopkeeper().isBlank()) {
            criteria.add(Criteria.where("shopkeeperName").regex(request.getShopkeeper(), "i"));
        }
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(request.getKeyword(), "i"),
                    Criteria.where("description").regex(request.getKeyword(), "i"),
                    Criteria.where("shopkeeperName").regex(request.getKeyword(), "i")
            );
            criteria.add(keywordCriteria);
        }
        if (request.getShopkeeperId() != null && !request.getShopkeeperId().isBlank()) {
            criteria.add(Criteria.where("shopkeeperId").is(request.getShopkeeperId()));
        }
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            criteria.add(Criteria.where("tags").in(request.getTags()));
        }

        if (request.getMinPrice() != null) {
            criteria.add(Criteria.where("price").gte(request.getMinPrice()));
        }

        if (request.getMaxPrice() != null) {
            criteria.add(Criteria.where("price").lte(request.getMaxPrice()));
        }

        criteria.add(Criteria.where("state").is(ProductState.LISTED));

        query.addCriteria(new Criteria().andOperator(
            criteria.toArray(new Criteria[0])
        ));

        long total = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<ProductResultResponse> products =
                mongoTemplate
                .find(query, Product.class)
                .stream()
                .map(productMapper::mapToProductResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(products, pageable, total);
    }

    public List<String> getProductTags() {
        Query query = new Query(Criteria.where("state").is(ProductState.LISTED));
        return mongoTemplate.findDistinct(query, "tags", Product.class, String.class);
    }

    public Page<ProductResultResponse> getMyProducts(ProductRequest request, Pageable pageable, User user) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        // Only select product from caller user id
        criteria.add(Criteria.where("shopkeeperId").regex(user.getId(), "i"));

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            criteria.add(Criteria.where("tags").in(request.getTags()));
        }

        if (request.getMinPrice() != null) {
            criteria.add(Criteria.where("price").gte(request.getMinPrice()));
        }

        if (request.getMaxPrice() != null) {
            criteria.add(Criteria.where("price").lte(request.getMaxPrice()));
        }

        if (request.getState() != null) {
            criteria.add(Criteria.where("state").is(request.getState()));
        }

        query.addCriteria(new Criteria().andOperator(
                criteria.toArray(new Criteria[0])
        ));

        long total = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<ProductResultResponse> products =
                mongoTemplate
                        .find(query, Product.class)
                        .stream()
                        .map(productMapper::mapToProductResponse)
                        .collect(Collectors.toList());

        return new PageImpl<>(products, pageable, total);
    }

    public Product getProductDetail(String id) {
        return productRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Product not found with id " + id)
        );
    }

    public Product createProduct(CreateProductRequest request, User shopkeeper) {
        // 1. Save all files first and get their URLs
        List<String> allFileUrls = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile image : request.getImages()) {
                try {
                    String fileName = fileService.saveFile(image);
                    allFileUrls.add(fileName);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to save image: " + e.getMessage());
                }
            }
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .images(allFileUrls)
                .tags(request.getTags())
                .shopkeeperId(shopkeeper.getId())
                .shopkeeperName(shopkeeper.getName())
                .createdDate(LocalDateTime.now())
                .state(ProductState.WAIT_APPROVE)
                .build();

        return productRepository.save(product);
    }

    public void deleteProduct(String id, User shopkeeper) {
        Product product = productRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Product with ID " + id + " does not exist."));

        // check owner of product
        if (!product.getShopkeeperId().equals(shopkeeper.getId())) {
            throw new UnautorizedException("You can't update this product");
        }

        // prevent deleting purchased products
        if (product.getState() == ProductState.PURCHASED) {
            throw new RuntimeException("Cannot delete a product that has already been purchased");
        }

        productRepository.deleteById(id);
    }

    public void updateProduct(String id, UpdateProductRequest request, User shopkeeper) {
        Product product = productRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Product with ID " + id + " does not exist."));

        // check owner of product
        if (!product.getShopkeeperId().equals(shopkeeper.getId())) {
            throw new UnautorizedException("You can't update this product");
        }

        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }

        // Image Synchronization Logic
        List<String> imagesToKeep = request.getExistingImages() != null ? request.getExistingImages() : new ArrayList<>();
        
        // 1. Save new images and combine with kept images
        List<String> finalImages = new ArrayList<>(imagesToKeep);
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile image : request.getImages()) {
                try {
                    String fileName = fileService.saveFile(image);
                    finalImages.add(fileName);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to save image: " + e.getMessage());
                }
            }
        }
        product.setImages(finalImages);

        if (request.getTags() != null) {
            List<String> tags = request.getTags().stream()
                    .filter(t -> t != null && !t.isBlank())
                    .collect(Collectors.toList());
            product.setTags(tags);
        }

        // Apply availability from request or force to false for re-approval
        product.setState(ProductState.WAIT_APPROVE);

        productRepository.save(product);
    }

    public void addReview(String productId, ReviewRequest request, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        // Owner can only reply, Customer can only review
        boolean isReply = request.getRepliedId() != null && product.getShopkeeperId().equals(user.getId());

        Review.ReviewBuilder reviewBuilder = Review.builder()
                .userId(user.getId())
                .userName(user.getName())
                .comment(request.getComment())
                .productId(request.getProductId())
                .shopkeeperId(product.getShopkeeperId())
                .createdDate(LocalDateTime.now());

        if (isReply) {
            reviewBuilder.replyId(request.getRepliedId());
        } else {
            reviewBuilder.rating(request.getRating());
        }
        Review review = reviewBuilder.build();
        reviewRepository.save(review);


        // Update average rating
        List<Review> reviews = reviewRepository.findByProductId(productId);
        double avg = reviews.stream()
                .filter(r -> r.getReplyId() == null)
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        product.setAverageRating(avg);
        productRepository.save(product);
    }

    public List<Review> getProductReviews(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    public ShopResponse getShopDetails(String shopkeeperId) {
        User shopkeeper = mongoTemplate.findById(shopkeeperId, User.class);
        if (shopkeeper == null) {
            throw new ResourceNotFoundException("Shopkeeper not found with ID: " + shopkeeperId);
        }

        List<Review> reviews = reviewRepository.findByShopkeeperId(shopkeeperId);
        List<Review> clientReviews = reviews.stream()
                .filter(r -> r.getReplyId() == null)
                .collect(Collectors.toList());

        long totalReviews = clientReviews.size();
        double avgRating = clientReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        return ShopResponse.builder()
                .id(shopkeeper.getId())
                .name(shopkeeper.getName())
                .email(shopkeeper.getEmail())
                .phone(shopkeeper.getPhone())
                .avatar("https://placehold.co/200x200?text=" + (shopkeeper.getName() != null ? shopkeeper.getName().replace(" ", "+") : "Shop"))
                .location("Bangkok, Thailand")
                .joinDate(shopkeeper.getCreatedAt() != null ? shopkeeper.getCreatedAt() : LocalDateTime.now())
                .rating(avgRating)
                .totalReviews(totalReviews)
                .build();
    }

    public List<ReviewResponse> getShopReviews(String shopkeeperId) {
        List<Review> reviews = reviewRepository.findByShopkeeperId(shopkeeperId);

        List<Review> clientReviews = reviews.stream()
                .filter(r -> r.getReplyId() == null)
                .collect(Collectors.toList());

        List<Review> replies = reviews.stream()
                .filter(r -> r.getReplyId() != null)
                .collect(Collectors.toList());

        List<ReviewResponse> response = new ArrayList<>();
        for (Review r : clientReviews) {
            String replyText = replies.stream()
                    .filter(rep -> r.getId().equals(rep.getReplyId()))
                    .map(Review::getComment)
                    .findFirst()
                    .orElse(null);

            ProductResultResponse productDto = null;
            if (r.getProductId() != null) {
                Product product = productRepository.findById(r.getProductId()).orElse(null);
                if (product != null) {
                    productDto = productMapper.mapToProductResponse(product);
                }
            }

            response.add(ReviewResponse.builder()
                    .id(r.getId())
                    .userId(r.getUserId())
                    .username(r.getUserName())
                    .productId(r.getProductId())
                    .product(productDto)
                    .comment(r.getComment())
                    .score(r.getRating())
                    .reply(replyText)
                    .createdAt(r.getCreatedDate())
                    .build());
        }
        return response;
    }
}
