package com.example.DevFolio.Backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "projects")
@Data
public class Project {

    @Id
    private String id;
    private String name;
    private String description;
    private String userId;
    private String language;
    private String repoUrl;
    private String image;
    private Integer order;
    private Integer stars;
    private Integer forks;
    private long displayOrder;
    private Boolean featured;





}
