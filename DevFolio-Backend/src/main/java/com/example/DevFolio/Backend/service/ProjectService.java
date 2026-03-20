package com.example.DevFolio.Backend.service;

import com.example.DevFolio.Backend.Exception.ResourceNotFoundException;
import com.example.DevFolio.Backend.dto.ProjectCardDto;
import com.example.DevFolio.Backend.dto.ProjectOrderDto;
import com.example.DevFolio.Backend.model.Devprofile;
import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import com.example.DevFolio.Backend.model.Project;
import com.example.DevFolio.Backend.model.Users;
import com.example.DevFolio.Backend.repository.DevprofileRepositary;
import com.example.DevFolio.Backend.repository.UserRepositary;
import com.example.DevFolio.Backend.repository.projectsRepositary;
import jakarta.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final projectsRepositary projectsRepositary;
    private final UserRepositary userRepositary;
    private final GithubService githubService;
    private final DevprofileRepositary devprofileRepositary;

    public Project addprojects(Project project, Authentication auth)  {

        OAuth2User oAuth2User =(OAuth2User) auth.getPrincipal();

        String provider=((OAuth2AuthenticationToken) auth).getAuthorizedClientRegistrationId();

        String email=oAuth2User.getAttribute("email");

        if(email==null && provider.equals("github")){
            String login=oAuth2User.getAttribute("login");
            email=login+"@github";
        }

        Users user=userRepositary.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));
        Devprofile dev=devprofileRepositary.findByUserId(user.getId()).orElseThrow(()->new RuntimeException("Profile not found"));

        project.setUserId(user.getId());
        project.setFeatured(false);
        long count = projectsRepositary.countByUserId(user.getId());
        if(count >= 4 && dev.getSubscriptionTier()!= SubscriptionTier.PRO){
            throw new RuntimeException("Maximum 4 projects allowed");
        }

        if(count>=6 && dev.getSubscriptionTier()== SubscriptionTier.PRO){
            throw new RuntimeException("Maximum 6 projects allowed");
        }
        project.setDisplayOrder((int) count + 1);



        ProjectCardDto finalproject=githubService.getRepoData(project.getRepoUrl());

        project.setName(finalproject.getName());
        project.setDescription(finalproject.getDescription());
        project.setImage(finalproject.getImage());

        project.setForks(finalproject.getForks());
        project.setStars(finalproject.getStars());
        project.setLanguage(finalproject.getLanguage());

        return projectsRepositary.save(project);
    }

    public void reorderProjects(List<ProjectOrderDto> orders){

        for(ProjectOrderDto dto : orders){

            Project project = projectsRepositary.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            project.setDisplayOrder(dto.getDisplayorder());

            projectsRepositary.save(project);
        }

    }
    public void featuredprojects(String id) {
        Project project=projectsRepositary.findById(id).orElseThrow(()->new ResourceNotFoundException("Project not found"));
        project.setFeatured(true);
        projectsRepositary.save(project);
    }

}
