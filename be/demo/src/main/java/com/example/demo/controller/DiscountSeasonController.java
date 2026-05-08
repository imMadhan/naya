package com.example.demo.controller;

import com.example.demo.entity.DiscountSeason;
import com.example.demo.service.DiscountSeasonService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seasons")
@CrossOrigin("*")
public class DiscountSeasonController {

    private DiscountSeasonService service;

    public DiscountSeasonController(DiscountSeasonService service) {
        this.service = service;
    }

    @PostMapping
    public DiscountSeason create(@RequestBody DiscountSeason season) {
        return service.create(season);
    }

    @GetMapping
    public List<DiscountSeason> getAll() {
        return service.getAll();
    }
}
