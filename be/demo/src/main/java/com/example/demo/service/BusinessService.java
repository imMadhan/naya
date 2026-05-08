package com.example.demo.service;

import com.example.demo.entity.Business;
import com.example.demo.repository.BusinessRepository;
import org.springframework.stereotype.Service;
import com.example.demo.util.GeoUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class BusinessService {

    private BusinessRepository businessRepository;

    public BusinessService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    // REGISTER
    public Business register(Business business) {

        Business existing = businessRepository.findByEmailId(business.getEmailId());

        if (existing != null) {
            throw new RuntimeException("Email already registered!");
        }

        return businessRepository.save(business);
    }

    // LOGIN
    public Business login(String emailId, String password) {

        Business business = businessRepository.findByEmailId(emailId);

        if (business == null) {
            throw new RuntimeException("Business not registered!");
        }

        if (!business.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials!");
        }

        return business;
    }

    // GET ALL
    public List<Business> getAll() {
        return businessRepository.findAll();
    }

    // GET BY ID
    public Business getById(Long id) {
        return businessRepository.findById(id).orElse(null);
    }

    // UPDATE
    public Business update(Long id, Business updated) {

        Business existing = businessRepository.findById(id).orElse(null);

        if (existing == null) {
            throw new RuntimeException("Business not found!");
        }

        existing.setName(updated.getName());
        existing.setBusinessType(updated.getBusinessType());
        existing.setCategory(updated.getCategory());
        existing.setOwnerName(updated.getOwnerName());
        existing.setEmailId(updated.getEmailId());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setAddress(updated.getAddress());
        existing.setLatitude(updated.getLatitude());
        existing.setLongitude(updated.getLongitude());
        existing.setCity(updated.getCity());
        existing.setPincode(updated.getPincode());
        existing.setPassword(updated.getPassword());
        existing.setImageUrl(updated.getImageUrl());

        return businessRepository.save(existing);
    }

    // DELETE
    public void delete(Long id) {

        Business existing = businessRepository.findById(id).orElse(null);

        if (existing == null) {
            throw new RuntimeException("Business not found!");
        }

        businessRepository.deleteById(id);
    }
    public List<Business> getNearbyShops(
            double userLat,
            double userLng,
            double radiusKm) {

        List<Business> allShops = businessRepository.findAll();

        List<Business> nearby = new ArrayList<>();

        for (Business shop : allShops) {

            if (shop.getLatitude() == null ||
                shop.getLongitude() == null) {
                continue;
            }

            double distance = GeoUtils.calculateDistance(
                    userLat,
                    userLng,
                    shop.getLatitude(),
                    shop.getLongitude()
            );

            if (distance <= radiusKm) {
                nearby.add(shop);
            }
        }

        return nearby;
    }
}
