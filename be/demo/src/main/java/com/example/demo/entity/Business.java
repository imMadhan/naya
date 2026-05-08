package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "businesses")
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String businessType;
    private String category;
    private String ownerName;

    @Column(unique = true)
    private String emailId;

    private String phoneNumber;
    private String address;
    private Double latitude;
    private Double longitude;
    private String city;
    private String pincode;
    private String password;

    private String imageUrl;
    public Business() {
    }

    public Business(String name, String businessType, String category,
                    String ownerName, String emailId, String phoneNumber,
                    String address, Double latitude, Double longitude,
                    String city, String pincode, String password, String imageUrl) {
        this.name = name;
        this.businessType = businessType;
        this.category = category;
        this.ownerName = ownerName;
        this.emailId = emailId;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.city = city;
        this.pincode = pincode;
        this.password = password;
        this.imageUrl = imageUrl;
        
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getBusinessType() { return businessType; }

    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public String getCategory() { return category; }

    public void setCategory(String category) { this.category = category; }

    public String getOwnerName() { return ownerName; }

    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getEmailId() { return emailId; }

    public void setEmailId(String emailId) { this.emailId = emailId; }

    public String getPhoneNumber() { return phoneNumber; }

    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }

    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }

    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }

    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getCity() { return city; }

    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }

    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }
    
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

}
