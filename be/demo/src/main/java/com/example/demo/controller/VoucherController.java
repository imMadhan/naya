package com.example.demo.controller;

import com.example.demo.entity.Voucher;
import com.example.demo.service.VoucherService;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vouchers")
@CrossOrigin("*")
public class VoucherController {

    private VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    // CLAIM VOUCHER
    @PostMapping("/claim")
    public Voucher claimVoucher(@RequestParam Long userId,
                                @RequestParam Long productId) {
        return voucherService.claimVoucher(userId, productId);
    }

    // USE VOUCHER
    @PutMapping("/use/{voucherId}")
    public Voucher useVoucher(@PathVariable Long voucherId) {
        return voucherService.useVoucher(voucherId);
    }
 // Get all users who claimed a product
    @GetMapping("/product/{productId}")
    public List<Voucher> getByProduct(@PathVariable Long productId) {
        return voucherService.getVouchersByProduct(productId);
    }

    // Get all products claimed by user
    @GetMapping("/user/{userId}")
    public List<Voucher> getByUser(@PathVariable Long userId) {
        return voucherService.getVouchersByUser(userId);
    }

    @GetMapping("/download/{voucherId}")
    public ResponseEntity<byte[]> downloadVoucher(
            @PathVariable Long voucherId) throws Exception {

        byte[] image = voucherService.generateVoucherImage(voucherId);

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=voucher.png")
                .header("Content-Type", "image/png")
                .body(image);
    }
}
