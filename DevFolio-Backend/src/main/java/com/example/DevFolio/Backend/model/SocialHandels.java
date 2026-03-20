package com.example.DevFolio.Backend.model;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SocialHandels {

    private String github;

    private String linkedin;
    private String codeforces;
    private String leetcode;

    private String portfolio;
}
