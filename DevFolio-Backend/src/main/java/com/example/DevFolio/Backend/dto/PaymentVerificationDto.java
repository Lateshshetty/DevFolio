package com.example.DevFolio.Backend.dto;


import lombok.Data;

@Data
public class PaymentVerificationDto {

    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
}
