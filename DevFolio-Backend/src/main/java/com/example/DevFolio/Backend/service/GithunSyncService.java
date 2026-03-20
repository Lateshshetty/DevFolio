package com.example.DevFolio.Backend.service;

import com.example.DevFolio.Backend.dto.ProjectCardDto;
import com.example.DevFolio.Backend.model.Project;
import com.example.DevFolio.Backend.repository.projectsRepositary;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GithunSyncService {

    private final GithubService githubService;
    private final projectsRepositary projectsRepositary;

    @Scheduled(cron = "0 0 2 * * ?")
    public void syncgithub(){

        List<Project> projects=projectsRepositary.findAll();

        for(Project project:projects){
            ProjectCardDto  projectCardDto=githubService.getRepoData(project.getRepoUrl());
            project.setName(projectCardDto.getName());
            project.setStars(projectCardDto.getStars());
            project.setDescription(projectCardDto.getDescription());
            project.setForks(projectCardDto.getForks());
            project.setLanguage(projectCardDto.getLanguage());
            projectsRepositary.save(project);

        }
    }
}
