package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phoneNumber;

    @Column(unique = true)
    private String email;

    private String gender;
    private LocalDate birthday;
    private LocalDate anniversary;
    private String password;

    // 🔹 New Location Fields
    private String address;
    private String latitude;
    private String longitude;
    
    @OneToMany(mappedBy = "user")
    private List<Voucher> vouchers;

    @ManyToMany
    @JoinTable(
            name = "user_favorites",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> favoriteProducts;

    public List<Product> getFavoriteProducts() {
        return favoriteProducts;
    }

    public void setFavoriteProducts(List<Product> favoriteProducts) {
        this.favoriteProducts = favoriteProducts;
    }


    public User() {
    }

    public User(String name, String phoneNumber, String email,
                String gender, LocalDate birthday,
                LocalDate anniversary, String password,
                String address, String latitude, String longitude) {

        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.gender = gender;
        this.birthday = birthday;
        this.anniversary = anniversary;
        this.password = password;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }

    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getGender() { return gender; }

    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getBirthday() { return birthday; }

    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    public LocalDate getAnniversary() { return anniversary; }

    public void setAnniversary(LocalDate anniversary) { this.anniversary = anniversary; }

    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }

    public void setAddress(String address) { this.address = address; }

    public String getLatitude() { return latitude; }

    public void setLatitude(String latitude) { this.latitude = latitude; }

    public String getLongitude() { return longitude; }

    public void setLongitude(String longitude) { this.longitude = longitude; }
}
