package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;
    private String imageUrl;
    private Double price;
    private Double discount;
    private String description;
    private LocalDate validityDate;

    private Integer availableDiscountVouchers;
    private Integer soldDiscountVouchers;
    private Integer totalDiscountVouchers;

    private String category;

    @ManyToOne
    @JoinColumn(name = "business_id")
    private Business business;

    
    
    
    @OneToMany(mappedBy = "product")
    private List<Voucher> vouchers;


    @ManyToOne
    @JoinColumn(name = "season_id")
    private DiscountSeason discountSeason;
    
    @ManyToMany(mappedBy = "favoriteProducts")
    private List<User> usersWhoFavorited;


    public DiscountSeason getDiscountSeason() {
        return discountSeason;
    }

    public void setDiscountSeason(DiscountSeason discountSeason) {
        this.discountSeason = discountSeason;
    }

    
    public Product() {
    }

    public Product(String productName, String imageUrl, Double price,
                   Double discount, String description,
                   LocalDate validityDate,
                   Integer availableDiscountVouchers,
                   Integer soldDiscountVouchers,
                   Integer totalDiscountVouchers,
                   String category,
                   Business business) {

        this.productName = productName;
        this.imageUrl = imageUrl;
        this.price = price;
        this.discount = discount;
        this.description = description;
        this.validityDate = validityDate;
        this.availableDiscountVouchers = availableDiscountVouchers;
        this.soldDiscountVouchers = soldDiscountVouchers;
        this.totalDiscountVouchers = totalDiscountVouchers;
        this.category = category;
        this.business = business;
    }

    public Long getId() { return id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getValidityDate() { return validityDate; }
    public void setValidityDate(LocalDate validityDate) { this.validityDate = validityDate; }

    public Integer getAvailableDiscountVouchers() { return availableDiscountVouchers; }
    public void setAvailableDiscountVouchers(Integer availableDiscountVouchers) { this.availableDiscountVouchers = availableDiscountVouchers; }

    public Integer getSoldDiscountVouchers() { return soldDiscountVouchers; }
    public void setSoldDiscountVouchers(Integer soldDiscountVouchers) { this.soldDiscountVouchers = soldDiscountVouchers; }

    public Integer getTotalDiscountVouchers() { return totalDiscountVouchers; }
    public void setTotalDiscountVouchers(Integer totalDiscountVouchers) { this.totalDiscountVouchers = totalDiscountVouchers; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }
}
