package com.example.demo.service;

import com.example.demo.entity.Business;
import com.example.demo.entity.DiscountSeason;
import com.example.demo.entity.Product;
import com.example.demo.repository.BusinessRepository;
import com.example.demo.repository.DiscountSeasonRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;


import java.util.List;
import java.util.Optional;

@Transactional
@Service
public class ProductService {

    private ProductRepository productRepository;
    private BusinessRepository businessRepository;
    private DiscountSeasonRepository discountSeasonRepository;

    public ProductService(ProductRepository productRepository,
                          BusinessRepository businessRepository,
                          DiscountSeasonRepository discountSeasonRepository) {
        this.productRepository = productRepository;
        this.businessRepository = businessRepository;
        this.discountSeasonRepository = discountSeasonRepository;
    }

    // CREATE PRODUCT
    public Product createProduct(Product product,
                                 Long businessId,
                                 Long seasonId) {

        Optional<Business> businessOptional =
                businessRepository.findById(businessId);

        if (!businessOptional.isPresent()) {
            throw new RuntimeException("Business not found!");
        }

        Optional<DiscountSeason> seasonOptional =
                discountSeasonRepository.findById(seasonId);

        if (!seasonOptional.isPresent()) {
            throw new RuntimeException("Season not found!");
        }

        Business business = businessOptional.get();
        DiscountSeason season = seasonOptional.get();

        product.setBusiness(business);
        product.setDiscountSeason(season);

        product.setSoldDiscountVouchers(0);
        product.setAvailableDiscountVouchers(
                product.getTotalDiscountVouchers()
        );

        return productRepository.save(product);
    }

    // GET ALL PRODUCTS
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    // GET PRODUCTS BY BUSINESS
    public List<Product> getByBusiness(Long businessId) {
        return productRepository.findByBusinessId(businessId);
    }

    // GET BY ID
    public Product getById(Long id) {

        Optional<Product> productOptional =
                productRepository.findById(id);

        if (!productOptional.isPresent()) {
            throw new RuntimeException("Product not found!");
        }

        return productOptional.get();
    }

    // UPDATE
    public Product update(Long id, Product updated) {

        Optional<Product> optional =
                productRepository.findById(id);

        if (!optional.isPresent()) {
            throw new RuntimeException("Product not found!");
        }

        Product existing = optional.get();

        existing.setProductName(updated.getProductName());
        existing.setImageUrl(updated.getImageUrl());
        existing.setPrice(updated.getPrice());
        existing.setDiscount(updated.getDiscount());
        existing.setDescription(updated.getDescription());
        existing.setValidityDate(updated.getValidityDate());
        existing.setCategory(updated.getCategory());

        if (updated.getTotalDiscountVouchers() != null) {

            Integer oldSold = existing.getSoldDiscountVouchers();
            Integer newTotal = updated.getTotalDiscountVouchers();

            existing.setTotalDiscountVouchers(newTotal);
            existing.setAvailableDiscountVouchers(newTotal - oldSold);
        }

        return productRepository.save(existing);
    }

    // DELETE
    public void delete(Long id) {

        Optional<Product> optional =
                productRepository.findById(id);

        if (!optional.isPresent()) {
            throw new RuntimeException("Product not found!");
        }

        productRepository.deleteById(id);
    }
    
    public Product getProductWithBuyers(Long productId) {
        return productRepository.findById(productId).orElse(null);
    }

}
