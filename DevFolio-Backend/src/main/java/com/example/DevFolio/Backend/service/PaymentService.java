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

    public Map<String, Object> Verifypayment(PaymentVerificationDto paymentVerification, Authentication authentication) {

        Map<String, Object> response = new HashMap<>();
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String provider = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();

            if (email == null && provider.equals("github")) {
                String name=oAuth2User.getAttribute("name");
                email=name+"@github";
            }

            final String finalEmail = email;

            Users user = userRepositary.findByEmail(finalEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + finalEmail));

            Devprofile devprofile = devprofileRepositary.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

            log.info("Payment verification - paymentId: {}, orderId: {}, userId: {}",
                    paymentVerification.getRazorpayPaymentId(),
                    paymentVerification.getRazorpayOrderId(),
                    user.getId());

            String orderId = paymentVerification.getRazorpayOrderId();
            String paymentId = paymentVerification.getRazorpayPaymentId();
            String signature = paymentVerification.getRazorpaySignature();

            boolean isValid;


            if (orderId == null || orderId.isEmpty() || orderId.equals("undefined")) {
                isValid = paymentId != null && paymentId.startsWith("pay_");
            } else {
                isValid = verifySignature(orderId, paymentId, signature);
            }

            if (isValid) {
                devprofile.setSubscriptionTier(SubscriptionTier.PRO);
                devprofile.setUpdatedAt(LocalDateTime.now());
                devprofileRepositary.save(devprofile);

                log.info("User {} upgraded to PRO", user.getId());

                response.put("success", true);
                response.put("message", "Payment verified successfully");
                response.put("subscriptionTier", "PRO");
            } else {
                log.warn("Payment verification failed for paymentId: {}", paymentId);
                response.put("success", false);
                response.put("message", "Payment verification failed");
            }

            return response;

        } catch (ResourceNotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        } catch (Exception e) {
            log.error("Verification error: {}", e.getMessage(), e);
            throw new RuntimeException("Verify payment failed: " + e.getMessage());
        }
    }

    private Boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            if (orderId == null || paymentId == null || signature == null) {
                return false;
            }

            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString().equals(signature);

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Signature crypto error: {}", e.getMessage());
            return false;
        }
    }
}