package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.ValidationOTPRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.service.OTPService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OTPController {
    OTPService service;

    @PostMapping
    ApiResponse<Boolean> validateOTP(@RequestBody @Valid ValidationOTPRequest otpRequest) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .message("Result validation OTP code:")
                .result(service.validateSecureOTP(otpRequest))
                .build();
    }
}
