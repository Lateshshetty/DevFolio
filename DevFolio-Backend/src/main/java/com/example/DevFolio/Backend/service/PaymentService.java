package com.example.DevFolio.Backend.service;

import com.example.DevFolio.Backend.Exception.ResourceNotFoundException;
import com.example.DevFolio.Backend.dto.PaymentVerificationDto;
import com.example.DevFolio.Backend.model.Devprofile;
import com.example.DevFolio.Backend.model.Enum.SubscriptionTier;
import com.example.DevFolio.Backend.model.Users;
import com.example.DevFolio.Backend.repository.DevprofileRepositary;
import com.example.DevFolio.Backend.repository.UserRepositary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final UserRepositary userRepositary;
    private final DevprofileRepositary devprofileRepositary;

    public Map<String,Object>Verifypayment(PaymentVerificationDto paymentVerification, Authentication authentication) {

        Map<String,Object> responce = new HashMap<>();
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            String email = oAuth2User.getAttribute("email");

            String provider=((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();

            if (email == null && provider.equals("github")) {
                String name=oAuth2User.getAttribute("name");
                email=name+"@github.com";
            }

            final  String  finalemail=email;

            Users user=userRepositary.findByEmail(finalemail).orElseThrow(()->new ResourceNotFoundException("User not found"));

            Devprofile devprofile=devprofileRepositary.findByUserId(user.getId()).orElseThrow(()->new ResourceNotFoundException("Profile not found"));


            boolean isValid=verifySignature(paymentVerification.getRazorpayOrderId(), paymentVerification.getRazorpayPaymentId(),paymentVerification.getRazorpaySignature());

            if (isValid) {

                devprofile.setSubscriptionTier(SubscriptionTier.PRO);
                devprofile.setUpdatedAt(LocalDateTime.now());
                devprofileRepositary.save(devprofile);

                responce.put("Sucess",true);
                responce.put("message","Payment verification successful");

                responce.put("subscriptionTier", "PRO");
            } else {

                responce.put("success", false);
                responce.put("message", "Payment verification failed");
            }
        return responce;
        }catch (Exception e){
            throw new RuntimeException("Verifypayment failed "+e.getMessage());
        }


    }


    public Boolean verifySignature(String OrderId,String PaymentId,String signature) throws NoSuchAlgorithmException {

        try{
            String payload=OrderId+"|"+PaymentId;

            Mac mac=Mac.getInstance("HmacSHA256");

            SecretKeySpec scretKeySpec=new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8),"HmacSHA256");
            try {
                mac.init(scretKeySpec);
            } catch (InvalidKeyException e) {
                throw new RuntimeException(e);
            }


            byte[] hash=mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString=new StringBuilder();
            for (byte b : hash) {
                String hex=Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);


        }catch (Exception e){
            System.out.println("Signature generation is failed "+e.getMessage());
            return false;
        }
    }
    public Map<String, Object> createOrder(Integer amount, Authentication auth) {
        Map<String, Object> response = new HashMap<>();
        response.put("key", razorpayKeyId);
        response.put("amount", amount * 100);
        response.put("currency", "INR");
        return response;
    }


}
