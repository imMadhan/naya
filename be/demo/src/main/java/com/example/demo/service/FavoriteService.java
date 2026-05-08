package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FavoriteService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public FavoriteService(UserRepository userRepository,
                           ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // ADD TO FAVORITES
    public User addToFavorites(Long userId, Long productId) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found!");
        }

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            throw new RuntimeException("Product not found!");
        }

        if (user.getFavoriteProducts() == null) {
            user.setFavoriteProducts(new ArrayList<>());
        }

        if (user.getFavoriteProducts().contains(product)) {
            throw new RuntimeException("Product already in favorites!");
        }

        user.getFavoriteProducts().add(product);

        return userRepository.save(user);
    }

    // REMOVE FROM FAVORITES
    public User removeFromFavorites(Long userId, Long productId) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found!");
        }

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            throw new RuntimeException("Product not found!");
        }

        if (user.getFavoriteProducts() != null) {
            user.getFavoriteProducts().remove(product);
        }

        return userRepository.save(user);
    }

    // GET USER FAVORITES
    public List<Product> getUserFavorites(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            throw new RuntimeException("User not found!");
        }

        return user.getFavoriteProducts();
    }
}