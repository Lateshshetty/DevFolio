package com.example.DevFolio.Backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
@Service
@RequiredArgsConstructor
public class CodeforcesService {

    public Map getuserInfo(String username) {

        String url= "https://codeforces.com/api/user.info?handles=" + username;

        RestTemplate restTemplate = new RestTemplate();

        Map response;

        try {
            response = restTemplate.getForObject(url, Map.class);
            }
        catch(Exception e){
            throw new RuntimeException("Invalid LeetCode");
        }

    if (response == null){
        return null;
    }

        List results = (List) response.get("result");
    return (Map) results.get(0);
    }
}
