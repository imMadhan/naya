package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin("*")
public class ProductController {

    private ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // CREATE
    @PostMapping("/business/{businessId}")
    public Product create(@RequestBody Product product,
                          @PathVariable Long businessId,
                          @RequestParam Long seasonId) {

        return productService.createProduct(product, businessId, seasonId);
    }


    // GET ALL
    @GetMapping
    public List<Product> getAll() {
        return productService.getAll();
    }

    // GET BY BUSINESS
    @GetMapping("/business/{businessId}")
    public List<Product> getByBusiness(@PathVariable Long businessId) {
        return productService.getByBusiness(businessId);
    }

 // GET PRODUCT BY ID
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id,
                          @RequestBody Product product) {
        return productService.update(id, product);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        productService.delete(id);
        return "Product deleted successfully!";
    }
}
