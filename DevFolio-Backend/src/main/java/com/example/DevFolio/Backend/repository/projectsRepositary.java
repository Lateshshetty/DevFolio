package com.example.DevFolio.Backend.repository;

import com.example.DevFolio.Backend.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface projectsRepositary extends MongoRepository<Project,String> {
List<Project> findByUserId(String userId);
    Optional<Project> findById(String Id);
    List<Project> findByUserIdOrderByDisplayOrderAsc(String userId);
    Long countByUserId(String userId);
}
