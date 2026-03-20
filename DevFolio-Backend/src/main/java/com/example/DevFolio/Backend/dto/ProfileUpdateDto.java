package com.example.DevFolio.Backend.dto;

import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import com.example.DevFolio.Backend.model.SocialHandels;
import com.example.DevFolio.Backend.model.ThemeConfig;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ProfileUpdateDto {


    @Size(max = 50, message = "Name cannot exceed 50 characters")
    private String name;

    @Size(max = 300, message = "Bio cannot exceed 300 characters")
    private String bio;

    @Size(max = 100, message = "Location too long")
    private String location;

    private List<
            @Size(max = 30, message = "Each tech stack item must be under 30 characters")
                    String> techStack;

    @Valid
    private SocialHandels socialHandels;

    @Valid
    private ThemeConfig themeConfig;

    private SubscriptionTier subscriptionTier;


    private boolean profilePublic;

    @Size(max = 500, message = "Photo URL too long")
    private String photoUrl;


    private boolean showProjects;
    private boolean showCodingStats;
    private boolean showSocialLinks;
    private boolean showTechStack;
}
