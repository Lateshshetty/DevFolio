package com.example.DevFolio.Backend.repository;

import com.example.DevFolio.Backend.model.Devprofile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface DevprofileRepositary extends MongoRepository<Devprofile, String> {

    Optional<Devprofile> findByUserId(String userId);
    boolean existsBySlug(String slug);
    Optional<Devprofile> findBySlug(String slug);
}
