package com.example.DevFolio.Backend.model;

import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThemeConfig {

    private String themeName;



    private String fontStyle;

    private String fontcolor;
}
