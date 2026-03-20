package com.example.DevFolio.Backend.repository;

import com.example.DevFolio.Backend.model.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepositary extends MongoRepository<Users, Integer> {
    Optional<Users> findByEmail(String email);
}
