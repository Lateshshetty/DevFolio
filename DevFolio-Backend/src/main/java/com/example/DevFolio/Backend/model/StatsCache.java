package com.example.DevFolio.Backend.model;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsCache {

    private Integer githubRepoCount;
    private Integer githubTotalStars;
    private String githubTopLanguage;

    private Integer leetcodeTotalSolved;
    private Integer leetcodeContestRating;

    private Integer codeforcesRating;

    private Integer developerScore;
}
