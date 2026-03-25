package com.example.DevFolio.Backend.service;

import com.example.DevFolio.Backend.Exception.ResourceNotFoundException;
import com.example.DevFolio.Backend.dto.CodingStatsDto;
import com.example.DevFolio.Backend.dto.ProfileResponseDto;
import com.example.DevFolio.Backend.dto.ProfileUpdateDto;
import com.example.DevFolio.Backend.dto.ProjectCardDto;
import com.example.DevFolio.Backend.model.*;
import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import com.example.DevFolio.Backend.repository.DevprofileRepositary;
import com.example.DevFolio.Backend.repository.ThemeRepository;
import com.example.DevFolio.Backend.repository.UserRepositary;
import com.example.DevFolio.Backend.repository.projectsRepositary;
import com.example.DevFolio.Backend.util.UsernameExtractor;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ThemeRepository themeRepository;
    private final LeetCodeService leetCodeService;
    private final CodeforcesService codeforcesService;
    private final UserRepositary userRepositary;
    private final DevprofileRepositary devprofileRepositary;
    private final ImageService imageService;
    private final projectsRepositary projectsRepositary;
    private  final ProjectService projectService;

    public ProfileResponseDto getProfile(Authentication auth){

        OAuth2User oAuth2User =(OAuth2User) auth.getPrincipal();

        String provider=((OAuth2AuthenticationToken) auth).getAuthorizedClientRegistrationId();

        String email=oAuth2User.getAttribute("email");

        if(email==null && provider.equals("github")){
            String name = oAuth2User.getAttribute("name");
            String login = oAuth2User.getAttribute("login");
            email = (name != null ? name : login) + "@github";
        }


        Users user=userRepositary.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found"));

        Devprofile devprofile=devprofileRepositary.findByUserId(user.getId()).orElseThrow(()->new ResourceNotFoundException("Profile not found"));

        return ProfileResponseDto.builder()
                .name(devprofile.getName())
                .slug(devprofile.getSlug())
                .bio(devprofile.getBio())
                .location(devprofile.getLocation())
                .techStack(devprofile.getTechStack())
                .profilePublic(devprofile.getProfilePublic())
                .profileVisits(Long.valueOf(devprofile.getProfilevisitCount()))
                .showProjects(devprofile.isShowProjects())
                .showCodingStats(devprofile.isShowCodingStats())
                .showSocialLinks(devprofile.isShowSocialLinks())
                .showTechStack(devprofile.isShowTechStack())
                .subscriptionTier(devprofile.getSubscriptionTier())
                .github(devprofile.getSocialHandles()!=null?devprofile.getSocialHandles().getGithub():null)
                .linkedin(devprofile.getSocialHandles()!=null?devprofile.getSocialHandles().getLinkedin():null)
                .leetcode(devprofile.getSocialHandles()!=null?devprofile.getSocialHandles().getLeetcode():null)
                .codeforces(devprofile.getSocialHandles()!=null?devprofile.getSocialHandles().getCodeforces():null)
                .portfolio(devprofile.getSocialHandles()!=null?devprofile.getSocialHandles().getPortfolio():null)
                .theme(devprofile.getThemeConfig()!=null?devprofile.getThemeConfig().getThemeName():null)

                .photoUrl(devprofile.getPhotourl()!=null?devprofile.getPhotourl():null)
                .fontcolor(devprofile.getThemeConfig() != null ? devprofile.getThemeConfig().getFontcolor() : null)

                .fontStyle(devprofile.getThemeConfig() != null ? devprofile.getThemeConfig().getFontStyle() : null).photoUrl(devprofile.getPhotourl())
                .profilePublic(devprofile.getProfilePublic())
                .profileVisits(Long.valueOf(devprofile.getProfilevisitCount()))
                .build();
    }

    public Object getuserbyslug(String slug, Authentication auth, HttpSession session){

        Devprofile devprofile=devprofileRepositary.findBySlug(slug).orElseThrow(()->new ResourceNotFoundException("Profile not found"));
        String currentUserId = null;

        if (auth != null && auth.getPrincipal() instanceof OAuth2User oAuth2User) {

            String email = oAuth2User.getAttribute("email");
            String provider=((OAuth2AuthenticationToken) auth).getAuthorizedClientRegistrationId();
            if(email==null && provider.equals("github")){
                String name = oAuth2User.getAttribute("name");
                String login = oAuth2User.getAttribute("login");
                email = (name != null ? name : login) + "@github";
            }
            Users user = userRepositary.findByEmail(email)
                    .orElse(null);

            if (user != null) {
                currentUserId = user.getId();
            }
        }
        boolean isOwner = devprofile.getUserId().equals(currentUserId);
        if(devprofile.getProfilePublic() && !isOwner){
            @SuppressWarnings("unchecked")
            Set<String> viewedProfiles = (Set<String>) session.getAttribute("viewedProfiles");

            if (viewedProfiles == null) {
                viewedProfiles = new HashSet<>();
                session.setAttribute("viewedProfiles", viewedProfiles);
            }

            if (!viewedProfiles.contains(slug)) {
                devprofile.setProfilevisitCount(devprofile.getProfilevisitCount() + 1);
                devprofileRepositary.save(devprofile);
                viewedProfiles.add(slug);
            }
        }
        if(Boolean.TRUE.equals(devprofile.getProfilePublic())){

            return maptoDto(devprofile);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("This profile is private");

    }

    public ProfileResponseDto updateProfile(Authentication auth, ProfileUpdateDto profileupdateDto){
        OAuth2User oAuth2User =(OAuth2User) auth.getPrincipal();
        String provider=((OAuth2AuthenticationToken) auth).getAuthorizedClientRegistrationId();

        String email=oAuth2User.getAttribute("email");

        if(email==null && provider.equals("github")){
            String name = oAuth2User.getAttribute("name");
            String login = oAuth2User.getAttribute("login");
            email = (name != null ? name : login) + "@github";
        }


        Users user=userRepositary.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found"));

        Devprofile devprofile=devprofileRepositary.findByUserId(user.getId()).orElseThrow(()->new ResourceNotFoundException("Profile not found"));

        if (profileupdateDto.getName() != null) {
            devprofile.setName(profileupdateDto.getName());
        }
        if (profileupdateDto.getBio() != null) {
            devprofile.setBio(profileupdateDto.getBio());
        }
        if (profileupdateDto.getLocation() != null) {
            devprofile.setLocation(profileupdateDto.getLocation());
        }
        ThemeConfig theme = profileupdateDto.getThemeConfig();

        if(theme != null && theme.getThemeName() != null){
            Theme dbTheme = themeRepository.findByThemeName(theme.getThemeName())
                    .orElseThrow(() -> new RuntimeException("Theme not found"));

            if(dbTheme.getTier() == SubscriptionTier.PRO &&
                    devprofile.getSubscriptionTier() != SubscriptionTier.PRO){
                throw new RuntimeException("PRO theme required");
            }

            devprofile.setThemeConfig(theme);
        }
        if (profileupdateDto.getTechStack() != null) {
            devprofile.setTechStack(profileupdateDto.getTechStack());
        }
        SocialHandels social=profileupdateDto.getSocialHandels();
        if (social != null) {
            if (social.getLeetcode() != null)
                social.setLeetcode(UsernameExtractor.extractLeetcodeName(social.getLeetcode()));
            if (social.getCodeforces() != null)
                social.setCodeforces(UsernameExtractor.extractCodeforcesName(social.getCodeforces()));
            if (social.getLinkedin() != null)
                social.setLinkedin(UsernameExtractor.extractLinkedinUsername(social.getLinkedin()));
            devprofile.setSocialHandles(social);
        }
        devprofile.setShowProjects(profileupdateDto.isShowProjects());
        devprofile.setShowCodingStats(profileupdateDto.isShowCodingStats());
        devprofile.setShowSocialLinks(profileupdateDto.isShowSocialLinks());
        devprofile.setShowTechStack(profileupdateDto.isShowTechStack());
        if (profileupdateDto.getSubscriptionTier() != null) {
            devprofile.setSubscriptionTier(profileupdateDto.getSubscriptionTier());
        }

        devprofile.setProfilePublic(profileupdateDto.isProfilePublic());
        if (profileupdateDto.getPhotoUrl() != null) {
            devprofile.setPhotourl(profileupdateDto.getPhotoUrl());
        }

        devprofileRepositary.save(devprofile);

        return maptoDto(devprofile);
    }

    public void updateImage (String url,String publicId,Authentication auth)throws IOException {

        OAuth2User oAuth2User =(OAuth2User) auth.getPrincipal();

        String provider=((OAuth2AuthenticationToken) auth).getAuthorizedClientRegistrationId();

        String email=oAuth2User.getAttribute("email");

        if(email==null && provider.equals("github")){
            String name = oAuth2User.getAttribute("name");
            String login = oAuth2User.getAttribute("login");
            email = (name != null ? name : login) + "@github";
        }

        Users user=userRepositary.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found"));

        Devprofile devprofile=devprofileRepositary.findByUserId(user.getId()).orElseThrow(()->new ResourceNotFoundException("Profile not found"));

        if (devprofile.getPhotoPublicId()!=null) {
            imageService.deleteImage(devprofile.getPhotoPublicId());
        }

        devprofile.setPhotourl(url);
        devprofile.setPhotoPublicId(publicId);

        devprofileRepositary.save(devprofile);
    }

    private ProfileResponseDto maptoDto(Devprofile devprofile){

        String linkedinUrl = null;

        if(devprofile.getSocialHandles() != null &&
                devprofile.getSocialHandles().getLinkedin() != null){

            linkedinUrl = "https://linkedin.com/in/" +
                    devprofile.getSocialHandles().getLinkedin();
        }

        ProfileResponseDto response = ProfileResponseDto.builder()
                .name(devprofile.getName())
                .slug(devprofile.getSlug())
                .bio(devprofile.getBio())
                .location(devprofile.getLocation())
                .techStack(devprofile.getTechStack())
                .github(devprofile.getSocialHandles()!=null ?
                        devprofile.getSocialHandles().getGithub() : null)
                .leetcode(devprofile.getSocialHandles()!=null ?
                        devprofile.getSocialHandles().getLeetcode() : null)
                .linkedin(linkedinUrl)
                .portfolio(devprofile.getSocialHandles()!=null ?
                        devprofile.getSocialHandles().getPortfolio() : null)

                .theme(devprofile.getThemeConfig()!=null ?
                        devprofile.getThemeConfig().getThemeName() : null)



                .fontcolor(devprofile.getThemeConfig()!=null ?
                        devprofile.getThemeConfig().getFontcolor() : null)

                .fontStyle(devprofile.getThemeConfig()!=null ?
                        devprofile.getThemeConfig().getFontStyle() : null)

                .photoUrl(devprofile.getPhotourl())
                .profilePublic(devprofile.getProfilePublic())
                .profileVisits(Long.valueOf(devprofile.getProfilevisitCount()))
                .showProjects(devprofile.isShowProjects())
                .showCodingStats(devprofile.isShowCodingStats())
                .showSocialLinks(devprofile.isShowSocialLinks())
                .showTechStack(devprofile.isShowTechStack())
                .subscriptionTier(devprofile.getSubscriptionTier())
                .codeforces(devprofile.getSocialHandles()!=null ? devprofile.getSocialHandles().getCodeforces() : null)
                .build();


        if(!devprofile.isShowCodingStats()){
            response.setCodingStats(null);
        }

        if(devprofile.isShowProjects()){
            response.setProjects(getProjectCards(devprofile.getSlug()));
        }

        return response;
    }
    public List<ProjectCardDto> getProjectCards(String slug) {
        Devprofile dev=devprofileRepositary.findBySlug(slug).orElseThrow(()->new ResourceNotFoundException("Profile not found"));
        if(Boolean.TRUE.equals(dev.getProfilePublic())) {
            List<Project> projects = projectsRepositary
                    .findByUserIdOrderByDisplayOrderAsc(dev.getUserId());
            List<ProjectCardDto> result = new ArrayList<>();

            for (Project project : projects) {
                ProjectCardDto dto = new ProjectCardDto();
                dto.setId(project.getId());
                dto.setName(project.getName());
                dto.setDescription(project.getDescription());
                dto.setLanguage(project.getLanguage());
                dto.setImage(project.getImage());
                dto.setStars(project.getStars());
                dto.setForks(project.getForks());
                dto.setRepoUrl(project.getRepoUrl());
                result.add(dto);
            }
            return result;
        }
        return null;
    }


    public void deleteprofile(Authentication authentication) {
        OAuth2User oAuth2User =(OAuth2User) authentication.getPrincipal();

        String provider=((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();

        String email=oAuth2User.getAttribute("email");

        if(email==null && provider.equals("github")){
            String name = oAuth2User.getAttribute("name");
            String login = oAuth2User.getAttribute("login");
            email = (name != null ? name : login) + "@github";
        }

        Users user= userRepositary.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found"));
        Devprofile devprofile= devprofileRepositary.findByUserId(user.getId()).orElseThrow(()->new ResourceNotFoundException("Profile not found"));
        List<Project> projects=projectsRepositary.findByUserIdOrderByDisplayOrderAsc(user.getId());

        for (Project project:projects){
            projectsRepositary.delete(project);
        }
        devprofileRepositary.delete(devprofile);
    }

    public void deleteproject(String id,Authentication authentication) {

        OAuth2User oAuth2User =(OAuth2User) authentication.getPrincipal();

        String provider=((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();

        String email=oAuth2User.getAttribute("email");

        if(email==null && provider.equals("github")){
            String name = oAuth2User.getAttribute("name");
            String login = oAuth2User.getAttribute("login");
            email = (name != null ? name : login) + "@github";
        }

        Users user= userRepositary.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found"));

        Project project = projectsRepositary.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if(!project.getUserId().equals(user.getId())){
            throw new RuntimeException("Unauthorized");
        }
        projectsRepositary.delete(project);

    }

    public CodingStatsDto getCodingStats(String slug) {

        Devprofile dev = devprofileRepositary.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        SocialHandels socialHandels = dev.getSocialHandles();
        if (Boolean.TRUE.equals(dev.getProfilePublic())) {
            CodingStatsDto stats = new CodingStatsDto();
            if (socialHandels == null) return stats;

            if (socialHandels.getLeetcode() != null) {

                try {

                    Map<String, Object> leetcodeData =
                            leetCodeService.getSolvedCount(socialHandels.getLeetcode());

                    if (leetcodeData != null) {

                        stats.setLeetcodeSolved(
                                (Integer) leetcodeData.get("solved"));

                        stats.setLeetcodeSubmissions(
                                (Integer) leetcodeData.get("submissions"));

                        stats.setLeetcodeRanking(
                                (Integer) leetcodeData.get("ranking"));
                    }

                } catch (Exception e) {
                    System.out.println("LeetCode API error: " + e.getMessage());
                }
            }

            if (socialHandels.getCodeforces() != null) {

                try {

                    Map data =
                            codeforcesService.getuserInfo(socialHandels.getCodeforces());

                    if (data != null) {

                        if (data.get("rating") != null) {
                            stats.setCodeforcesRating((Integer) data.get("rating"));
                        }

                        if (data.get("rank") != null) {
                            stats.setCodeforcesRank((String) data.get("rank"));
                        }
                    }

                } catch (Exception e) {
                    System.out.println("Codeforces API error: " + e.getMessage());
                }
            }


            return stats;

        }
        return null;
    }



}