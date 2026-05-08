package com.example.demo.repository;

import com.example.demo.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Long> {

    Business findByEmailId(String emailId);
}
