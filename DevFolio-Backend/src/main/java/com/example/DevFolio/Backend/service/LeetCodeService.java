package com.example.DevFolio.Backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LeetCodeService {

    public Map<String,Object> getSolvedCount(String username){

        String url = "https://leetcode.com/graphql";

        String query = """
        {
          "query":"query getUserProfile($username: String!) { matchedUser(username: $username) { profile { ranking } submitStats { acSubmissionNum { difficulty count } totalSubmissionNum { difficulty count } } } }",
          "variables":{"username":"%s"}
        }
        """.formatted(username);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(query, headers);

        RestTemplate restTemplate = new RestTemplate();

        Map response = restTemplate.postForObject(url, request, Map.class);

        Map data = (Map) response.get("data");
        Map matchedUser = (Map) data.get("matchedUser");

        Map profile = (Map) matchedUser.get("profile");

        Map submitStats = (Map) matchedUser.get("submitStats");

        List ac = (List) submitStats.get("acSubmissionNum");
        List total = (List) submitStats.get("totalSubmissionNum");

        int solved = (int)((Map)ac.get(0)).get("count");
        int submissions = (int)((Map)total.get(0)).get("count");
        int ranking = (int)profile.get("ranking");

        return Map.of(
                "solved", solved,
                "submissions", submissions,
                "ranking", ranking
        );
    }
}