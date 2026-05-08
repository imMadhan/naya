package com.example.demo.service;

import com.example.demo.entity.DiscountSeason;
import com.example.demo.repository.DiscountSeasonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiscountSeasonService {

    private DiscountSeasonRepository repository;

    public DiscountSeasonService(DiscountSeasonRepository repository) {
        this.repository = repository;
    }

    public DiscountSeason create(DiscountSeason season) {
        return repository.save(season);
    }

    public List<DiscountSeason> getAll() {
        return repository.findAll();
    }

    public DiscountSeason getById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
