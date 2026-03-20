package com.example.DevFolio.Backend.controller;

import com.example.DevFolio.Backend.dto.PaymentVerificationDto;
import com.example.DevFolio.Backend.service.PaymentService;
import com.razorpay.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.Objects;

@Controller
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationDto payment, Authentication auth){

        if (auth==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Sucess",false,"message","Authentication Failed"));
        }

        try {
            Map<String, Object> result=paymentService.Verifypayment(payment, auth);

            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("Sucess",false,"message",e.getMessage()));
        }


    }




    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestParam Integer amount,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }

        try {
            return ResponseEntity.ok(
                    paymentService.createOrder(amount, authentication)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create order"));
        }
    }
}
