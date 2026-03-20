package com.example.DevFolio.Backend.repository;

import com.example.DevFolio.Backend.model.Theme;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ThemeRepository extends MongoRepository<Theme,String> {

    Optional<Theme> findByThemeName(String themeName);

}