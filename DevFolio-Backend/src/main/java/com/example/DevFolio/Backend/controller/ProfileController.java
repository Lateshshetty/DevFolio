package com.example.DevFolio.Backend.controller;

import com.example.DevFolio.Backend.dto.ProfileUpdateDto;
import com.example.DevFolio.Backend.dto.ProjectOrderDto;
import com.example.DevFolio.Backend.model.Project;
import com.example.DevFolio.Backend.model.Theme;
import com.example.DevFolio.Backend.repository.DevprofileRepositary;
import com.example.DevFolio.Backend.repository.ThemeRepository;
import com.example.DevFolio.Backend.service.ImageService;
import com.example.DevFolio.Backend.service.ProfileService;
import com.example.DevFolio.Backend.service.ProjectService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/")
public class ProfileController {
    @Autowired
    private DevprofileRepositary devprofileRepositary;
    @Autowired
    private ProfileService profileService;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private ImageService imageService;
    @Autowired
    private ThemeRepository themeRepository;


    @PutMapping("/api/profile")
    public ResponseEntity<?> updateProfile(Authentication auth,@Valid @RequestBody ProfileUpdateDto profile){

        return ResponseEntity.ok(profileService.updateProfile(auth,profile));
    }
//    @GetMapping("/api/profile")
//    public ResponseEntity<?> getprofile(Authentication auth){
//
//        return ResponseEntity.ok(profileService.getProfile(auth));
//    }
    @GetMapping("/api/themes")
    public List<Theme> getThemes(){

        return themeRepository.findAll();
    }

    @GetMapping("/api/profile/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
    return ResponseEntity.ok(profileService.getProfile(authentication));
    }

    @GetMapping("/u/{slug}")
    public ResponseEntity<?> getSlug(
            @PathVariable String slug,
            Authentication authentication,
            HttpSession session
    ) {
        return ResponseEntity.ok(profileService.getuserbyslug(slug, authentication, session));
    }
    @DeleteMapping("/api/profile")
    public ResponseEntity<?> deleteProfile(Authentication authentication) {
        profileService.deleteprofile(authentication);
        return ResponseEntity.ok("Profile deleted successfully");
    }

    @PostMapping("/api/profile/image")
    public ResponseEntity<?> uploadImage(@RequestParam MultipartFile file, Authentication authentication)throws IOException {
        Map result = imageService.uploadImage(file);

        String url=(String) result.get("secure_url").toString();
        String publicId=(String) result.get("public_id").toString();

        profileService.updateImage(url,publicId,authentication);
        return ResponseEntity.ok(Map.of(
                "imageUrl", url));
    }

    @PostMapping("/api/project")
    public ResponseEntity<Project> projects(@RequestBody Project project, Authentication authentication) {

        return ResponseEntity.ok(projectService.addprojects(project,authentication));

    }

    @GetMapping("/u/{slug}/projects")
    public ResponseEntity<?> getProject(@PathVariable String slug) throws IOException {
        return ResponseEntity.ok(profileService.getProjectCards(slug));
    }
    @DeleteMapping("/api/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id,Authentication auth) {
        profileService.deleteproject(id,auth);
        return ResponseEntity.ok("Project deleted successfully");
    }
    @PutMapping("/api/projects/order")
    public ResponseEntity<?> reorderProjects(@RequestBody List<ProjectOrderDto> orders){

        projectService.reorderProjects(orders);

        return ResponseEntity.ok("Order updated");
    }

    @PutMapping("/api/projects/{id}/featured")
    public ResponseEntity<?> featuredprojects(@PathVariable String id){
        projectService.featuredprojects(id);
        return ResponseEntity.ok("Featured projects updated");
    }

    @GetMapping("/u/{slug}/coding-stats")
    public ResponseEntity<?> getCodingStats(@PathVariable String slug){

        return ResponseEntity.ok(
                profileService.getCodingStats(slug)
        );
    }
}
