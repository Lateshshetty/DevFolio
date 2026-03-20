package com.example.DevFolio.Backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "developer_profiles")
@Builder
public class Devprofile {

    @Id
    private String id;

    private String userId;

    @Indexed(unique = true)
    private String slug;
    private Integer ProfilevisitCount;
    private String name;
    private String bio;
    private String location;

    private String photourl;
    private String photoPublicId;

    private List<String> techStack;

    private SocialHandels socialHandles;

    private ThemeConfig themeConfig;

    private StatsCache statsCache;

    @Builder.Default
    private SubscriptionTier subscriptionTier=SubscriptionTier.FREE;

    private Boolean profilePublic;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean showProjects;
    private boolean showCodingStats;
    private boolean showSocialLinks;
    private boolean showTechStack;


}
