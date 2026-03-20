package com.example.DevFolio.Backend.service;

import com.example.DevFolio.Backend.dto.ProjectCardDto;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class GithubService {



    public ProjectCardDto getRepoData(String Url)  {

        String[] data=extractrepo(Url);

        String owner=data[0];
        String repo=data[1];
        Map response;
        String apiUrl="https://api.github.com/repos/"+owner+"/"+repo;
        RestTemplate restTemplate = new RestTemplate();
        try{
            response = restTemplate.getForObject(apiUrl, Map.class);
        }
        catch(Exception e){
            throw new RuntimeException("Invalid GitHub repository");
        }        if(response == null){
            throw new RuntimeException("GitHub repo not found");
        }
        ProjectCardDto projectCardDto=new ProjectCardDto();

        projectCardDto.setName(response.get("name").toString());

        projectCardDto.setDescription(
                response.get("description") != null ?
                        response.get("description").toString() :
                        ""
        );
        projectCardDto.setRepoUrl(response.get("html_url").toString());
        projectCardDto.setLanguage(response.get("language").toString());
        projectCardDto.setImage(
                "https://opengraph.githubassets.com/1/" + owner + "/" + repo        );
        projectCardDto.setStars((Integer) response.get("stargazers_count"));
        projectCardDto.setForks((Integer) response.get("forks_count"));
        return projectCardDto;
    }

  private  String[] extractrepo(String url) {
      String clean = url.replace("https://github.com/", "");
      if(clean.endsWith("git")){
          clean=clean.replace(".git","");
      }
      String[] part = clean.split("/");


        String owner=part[0];
        String repo=part[1];

        return new String []{owner,repo};


    }



}
