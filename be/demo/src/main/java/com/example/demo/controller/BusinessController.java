package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.Business;
import com.example.demo.service.BusinessService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/business")
public class BusinessController {

    private BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    // REGISTER
    @PostMapping("/register")
    public ApiResponse register(@RequestBody Business business) {

        Business saved = businessService.register(business);

        return new ApiResponse("Business registered successfully!", saved);
    }

    // LOGIN
    @PostMapping("/login")
    public ApiResponse login(@RequestBody LoginRequest request) {

        Business business = businessService.login(
                request.getEmail(),
                request.getPassword()
        );

        return new ApiResponse("Login successful!", business);
    }


    // GET ALL
    @GetMapping
    public List<Business> getAll() {
        return businessService.getAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Business getById(@PathVariable Long id) {
        return businessService.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Business update(@PathVariable Long id,
                           @RequestBody Business business) {
        return businessService.update(id, business);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        businessService.delete(id);
        return "Business deleted successfully!";
    }
    @GetMapping("/nearby")
    public List<Business> getNearbyShops(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5") double radius) {

        return businessService.getNearbyShops(
                latitude,
                longitude,
                radius
        );
    }

}
