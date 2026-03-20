package com.example.DevFolio.Backend.controller;


import com.example.DevFolio.Backend.Exception.ResourceNotFoundException;
import com.example.DevFolio.Backend.repository.UserRepositary;
import lombok.RequiredArgsConstructor;
import com.example.DevFolio.Backend.model.Users;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @Autowired
    private UserRepositary userRepositary;

    @GetMapping("/me")
   public ResponseEntity<?> getauth(Authentication authentication) {
        if(authentication==null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String provider = ((OAuth2AuthenticationToken) authentication)
                .getAuthorizedClientRegistrationId();
//        System.out.println("ATTRIBUTES: " + oAuth2User.getAttributes());
        if (provider.equals("github") && email == null) {
            String login = oAuth2User.getAttribute("login");
            email = login + "@github";
        }
        Users user = userRepositary.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found"));




        System.out.println("User Found");

        Map<String,Object> map = new HashMap<>();
        map.put("email",user.getEmail());
        map.put("id",user.getId());
        map.put("role",user.getRole());
        map.put("provider",user.getAuthProvider());
        map.put("createdAt",user.getCreatedAt());



        return ResponseEntity.ok(map);
    }
}