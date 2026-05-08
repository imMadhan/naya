package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String voucherCode;

    private LocalDate downloadDate;

    private Boolean used;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    
    public Voucher() {
    }

    public Voucher(String voucherCode, LocalDate downloadDate,
                   Boolean used, Product product, User user) {
        this.voucherCode = voucherCode;
        this.downloadDate = downloadDate;
        this.used = used;
        this.product = product;
        this.user = user;
    }

    public Long getId() { return id; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public LocalDate getDownloadDate() { return downloadDate; }
    public void setDownloadDate(LocalDate downloadDate) { this.downloadDate = downloadDate; }

    public Boolean getUsed() { return used; }
    public void setUsed(Boolean used) { this.used = used; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
