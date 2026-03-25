package com.example.DevFolio.Backend.security;

import com.example.DevFolio.Backend.model.Devprofile;
import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import com.example.DevFolio.Backend.model.Users;
import com.example.DevFolio.Backend.repository.DevprofileRepositary;
import com.example.DevFolio.Backend.repository.UserRepositary;
import com.example.DevFolio.Backend.util.SlugGenerator;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import static com.example.DevFolio.Backend.model.Enum.Role.DEVELOPER;
import static com.example.DevFolio.Backend.model.Enum.SubscriptionTier.FREE;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final DevprofileRepositary devprofileRepositary;
    private final UserRepositary repository;
    private String generateUniqueSlug(String name) {

        String slug;
        do {
            slug = SlugGenerator.generateSlug(name);
        } while (devprofileRepositary.existsBySlug(slug));

        return slug;
    }
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userreq)throws OAuth2AuthenticationException {

        OAuth2User OAuthuser=super.loadUser(userreq);

        String email=OAuthuser.getAttribute("email");
        String name = OAuthuser.getAttribute("name");
        String login = OAuthuser.getAttribute("login");       String provider=userreq.getClientRegistration().getRegistrationId();
        if (email == null && provider.equals("github")) {
            email = (name != null ? name : login) + "@github";        }
        final String finalemail=email;



        repository.findByEmail(finalemail).orElseGet(()->{
            Users user=new Users();
            user.setEmail(finalemail);
            user.setAuthProvider(provider);
            user.setRole(DEVELOPER);
            user.setCreatedAt(LocalDateTime.now());

           return repository.save(user);
        });

        Users users=repository.findByEmail(finalemail).get();
        if (name == null) {
            name = finalemail.split("@")[0];
        }
        final String finalname=name;
        devprofileRepositary.findByUserId(users.getId()).orElseGet(()->{
            Devprofile devprofile=new Devprofile();
            devprofile.setUserId(users.getId());
            devprofile.setSubscriptionTier(FREE);
            devprofile.setProfilevisitCount(0);
            devprofile.setProfilePublic(true);
            devprofile.setShowProjects(true);
            devprofile.setShowCodingStats(true);
            devprofile.setShowSocialLinks(true);
            devprofile.setShowTechStack(true);
            devprofile.setSlug(generateUniqueSlug(finalname));
            devprofile.setCreatedAt(LocalDateTime.now());

            return devprofileRepositary.save(devprofile);

        });

        return OAuthuser;
    }
}
