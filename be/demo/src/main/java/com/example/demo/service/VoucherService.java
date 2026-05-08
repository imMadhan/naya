package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.entity.Voucher;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.VoucherRepository;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public VoucherService(VoucherRepository voucherRepository,
                          ProductRepository productRepository,
                          UserRepository userRepository) {
        this.voucherRepository = voucherRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ================= CLAIM VOUCHER =================

    public Voucher claimVoucher(Long userId, Long productId) {

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            throw new RuntimeException("Product not found!");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found!");
        }

        if (product.getValidityDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Product offer expired!");
        }

        if (product.getAvailableDiscountVouchers() <= 0) {
            throw new RuntimeException("No vouchers available!");
        }

        Voucher existing =
                voucherRepository.findByUserIdAndProductId(userId, productId);

        if (existing != null) {
            throw new RuntimeException("You already claimed this voucher!");
        }

        String voucherCode = UUID.randomUUID().toString();

        Voucher voucher = new Voucher();
        voucher.setVoucherCode(voucherCode);
        voucher.setDownloadDate(LocalDate.now());
        voucher.setUsed(false);
        voucher.setProduct(product);
        voucher.setUser(user);

        product.setAvailableDiscountVouchers(
                product.getAvailableDiscountVouchers() - 1
        );

        product.setSoldDiscountVouchers(
                product.getSoldDiscountVouchers() + 1
        );

        productRepository.save(product);

        return voucherRepository.save(voucher);
    }

    // ================= USE VOUCHER =================

    public Voucher useVoucher(Long voucherId) {

        Voucher voucher = voucherRepository.findById(voucherId).orElse(null);

        if (voucher == null) {
            throw new RuntimeException("Voucher not found!");
        }

        if (voucher.getUsed()) {
            throw new RuntimeException("Voucher already used!");
        }

        voucher.setUsed(true);

        return voucherRepository.save(voucher);
    }

    // ================= GETTERS =================

    public List<Voucher> getVouchersByProduct(Long productId) {
        return voucherRepository.findByProductId(productId);
    }

    public List<Voucher> getVouchersByUser(Long userId) {
        return voucherRepository.findByUserId(userId);
    }

    // ================= GENERATE PNG =================

    public byte[] generateVoucherImage(Long voucherId) throws Exception {

        Voucher voucher = voucherRepository.findById(voucherId).orElse(null);

        if (voucher == null) {
            throw new RuntimeException("Voucher not found!");
        }

        BufferedImage template = ImageIO.read(
                getClass().getClassLoader()
                        .getResourceAsStream("static/voucher-template.png")
        );

        if (template == null) {
            throw new RuntimeException("Template image not found!");
        }

        Graphics2D g = template.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(Color.WHITE);

        int imageWidth = template.getWidth(); // 808
        // int imageHeight = template.getHeight(); // 1125

        // ================= SHOP NAME =================
        String shopName = voucher.getProduct().getBusiness().getName();
        if (shopName.length() > 25) {
            shopName = shopName.substring(0, 25) + "...";
        }

        g.setFont(new Font("SansSerif", Font.BOLD, 42));
        g.drawString(shopName, 139, 250);

        // ================= DISCOUNT =================
        int discount = voucher.getProduct().getDiscount().intValue();
        String discountText = discount + "%";

        Font discountFont = new Font("SansSerif", Font.BOLD, 120);
        g.setFont(discountFont);

        FontMetrics discountMetrics = g.getFontMetrics();
        int discountWidth = discountMetrics.stringWidth(discountText);
        int discountX = (imageWidth - discountWidth) / 2;

        g.drawString(discountText, discountX, 430);

        // ================= OFF =================
        String offText = "OFF";
        Font offFont = new Font("SansSerif", Font.BOLD, 90);
        g.setFont(offFont);

        FontMetrics offMetrics = g.getFontMetrics();
        int offWidth = offMetrics.stringWidth(offText);
        int offX = (imageWidth - offWidth) / 2;

        g.drawString(offText, offX, 520);

        // ================= PRODUCT =================
        String productName = voucher.getProduct().getProductName();
        Font productFont = adjustFontSize(g, productName, 650, 40);
        g.setFont(productFont);

        FontMetrics productMetrics = g.getFontMetrics();
        int productWidth = productMetrics.stringWidth(productName);
        int productX = (imageWidth - productWidth) / 2;

        g.drawString(productName, productX, 700);

        // ================= USER =================
        String userName = voucher.getUser().getName();
        Font userFont = adjustFontSize(g, userName, 650, 35);
        g.setFont(userFont);

        FontMetrics userMetrics = g.getFontMetrics();
        int userWidth = userMetrics.stringWidth(userName);
        int userX = (imageWidth - userWidth) / 2;

        g.drawString(userName, userX, 880);

        // ================= VALID DATE =================
        String validDate =
                voucher.getProduct().getValidityDate().toString();

        g.setFont(new Font("SansSerif", Font.PLAIN, 30));
        g.drawString(validDate, 139, 950);

        // ================= VOUCHER CODE =================
        String voucherCode = voucher.getVoucherCode();

        g.setFont(new Font("Monospaced", Font.BOLD, 22));
        g.drawString(voucherCode, 420, 950);


     // ================= QR CODE (RIGHT SIDE PERFECT ALIGN) =================

        int qrSize = 150;
        int rightMargin = 40;

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(
                voucherCode,
                BarcodeFormat.QR_CODE,
                qrSize,
                qrSize
        );

        BufferedImage qrImage =
                new BufferedImage(qrSize, qrSize,
                        BufferedImage.TYPE_INT_RGB);

        for (int x = 0; x < qrSize; x++) {
            for (int y = 0; y < qrSize; y++) {
                qrImage.setRGB(
                        x,
                        y,
                        bitMatrix.get(x, y)
                                ? Color.BLACK.getRGB()
                                : Color.WHITE.getRGB()
                );
            }
        }

        // Proper right alignment
        int qrX = template.getWidth() - qrSize - rightMargin;
        int qrY = 820;   // Adjust vertically inside card

        g.drawImage(qrImage, qrX, qrY, null);


        

        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(template, "png", baos);

        return baos.toByteArray();
    }

    // ================= AUTO FONT SCALE =================

    private Font adjustFontSize(Graphics2D g,
                                String text,
                                int maxWidth,
                                int initialSize) {

        int fontSize = initialSize;

        while (fontSize > 18) {
            Font font = new Font("Shippori Mincho B1",
                    Font.BOLD, fontSize);
            FontMetrics metrics = g.getFontMetrics(font);

            if (metrics.stringWidth(text) <= maxWidth) {
                return font;
            }

            fontSize -= 2;
        }

        return new Font("SansSerif", Font.BOLD, 18);
    }
}
