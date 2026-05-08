package com.example.demo.repository;

import com.example.demo.entity.DiscountSeason;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountSeasonRepository
        extends JpaRepository<DiscountSeason, Long> {
}
