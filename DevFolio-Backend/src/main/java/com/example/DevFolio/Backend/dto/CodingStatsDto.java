package com.example.DevFolio.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodingStatsDto {
    private Integer leetcodeSolved;
    private Integer codeforcesRating;
    private String codeforcesRank;
    private Integer leetcodeSubmissions;
    private Integer leetcodeRanking;



}
