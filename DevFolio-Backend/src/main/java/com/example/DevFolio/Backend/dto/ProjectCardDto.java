package com.example.DevFolio.Backend.dto;

import lombok.Data;

@Data
public class ProjectCardDto {

    private String id;
    private String name;
    private String description;
    private String repoUrl;
    private String language;
    private String image;
    private Integer stars;
    private Integer forks;


}
