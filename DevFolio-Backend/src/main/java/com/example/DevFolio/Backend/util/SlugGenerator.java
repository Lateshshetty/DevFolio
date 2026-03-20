package com.example.DevFolio.Backend.util;

import com.example.DevFolio.Backend.repository.DevprofileRepositary;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.security.SecureRandom;

@RequiredArgsConstructor
public class SlugGenerator {

    private static final SecureRandom random = new SecureRandom();
    public static String generateSlug(String name) {
        String finalname=name.trim().split("\\s+")[0];
        StringBuilder slug = new StringBuilder(finalname+"-");

        for (int i = 0; i < 3; i++) {
        int number = random.nextInt(10);
        slug.append(number);
        }

        return slug.toString();

    }

}
