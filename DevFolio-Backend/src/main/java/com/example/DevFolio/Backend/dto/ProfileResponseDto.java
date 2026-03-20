package com.example.DevFolio.Backend.dto;

import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProfileResponseDto {
        private String name;
        private String slug;
        private String bio;
        private String location;
        private List<String> techStack;
        private Long profileVisits;
        private Boolean profilePublic;
    private boolean showProjects;
    private boolean showCodingStats;
    private boolean showSocialLinks;
    private boolean showTechStack;

    private SubscriptionTier subscriptionTier;

        private String github;
        private String linkedin;
        private String leetcode;
    private String codeforces;
        private String portfolio;
    private CodingStatsDto codingStats;
    private List<ProjectCardDto> projects;

    private String theme;
    private String cardDesign;
    private String fontcolor;
    private String fontStyle;
        private String photoUrl;
    }

