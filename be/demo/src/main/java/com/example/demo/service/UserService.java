package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Register
    public User register(User user) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            throw new RuntimeException("Email already registered!");
        }

        return userRepository.save(user);
    }

    // Login
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not registered!");
        }

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials!");
        }

        return user;
    }

    // Get All
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get By Id
    public User getUserById(Long id) {

        return userRepository.findById(id).orElse(null);
    }

    // Update
    public User updateUser(Long id, User updatedUser) {

        User existingUser = userRepository.findById(id).orElse(null);

        if (existingUser == null) {
            throw new RuntimeException("User not found!");
        }

        existingUser.setName(updatedUser.getName());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setGender(updatedUser.getGender());
        existingUser.setBirthday(updatedUser.getBirthday());
        existingUser.setAnniversary(updatedUser.getAnniversary());
        existingUser.setPassword(updatedUser.getPassword());

        // 🔹 Update location
        existingUser.setAddress(updatedUser.getAddress());
        existingUser.setLatitude(updatedUser.getLatitude());
        existingUser.setLongitude(updatedUser.getLongitude());

        return userRepository.save(existingUser);
    }


    // Delete
    public void deleteUser(Long id) {

        User existingUser = userRepository.findById(id).orElse(null);

        if (existingUser == null) {
            throw new RuntimeException("User not found!");
        }

        userRepository.deleteById(id);
    }
    public void updateUserLocation(Long id, String latitude, String longitude) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLatitude(latitude);
        user.setLongitude(longitude);
        // optionally update address with reverse geocoding later

        userRepository.save(user);
    }
}
