package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.service.FavoriteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
@CrossOrigin("*")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    // ADD TO FAVORITES
    @PostMapping("/add")
    public User addToFavorites(@RequestParam Long userId,
                               @RequestParam Long productId) {
        return favoriteService.addToFavorites(userId, productId);
    }

    // REMOVE FROM FAVORITES
    @DeleteMapping("/remove")
    public User removeFromFavorites(@RequestParam Long userId,
                                    @RequestParam Long productId) {
        return favoriteService.removeFromFavorites(userId, productId);
    }

    // GET USER FAVORITES
    @GetMapping("/user/{userId}")
    public List<Product> getFavorites(@PathVariable Long userId) {
        return favoriteService.getUserFavorites(userId);
    }
}
