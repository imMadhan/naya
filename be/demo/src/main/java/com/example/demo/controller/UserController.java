package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;

import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/users")
public class UserController {

    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Register
    @PostMapping("/register")
    public ApiResponse register(@RequestBody User user) {

        User savedUser = userService.register(user);

        return new ApiResponse("User registered successfully!", savedUser);
    }

    // Login
    @PostMapping("/login")
    public ApiResponse login(@RequestBody LoginRequest request) {

        User user = userService.login(request.getEmail(), request.getPassword());

        return new ApiResponse("Login successful!", user);
    }

    // Get All
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get By Id
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Update
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id,
                           @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    // Delete
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);
        return "User deleted successfully!";
    }
    
 
}
