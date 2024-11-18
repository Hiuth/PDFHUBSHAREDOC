package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.SendEmailRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.service.MailService;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailController {
    MailService service;

    @PostMapping("/send/otp")
    ApiResponse<Boolean> sendOTPForRegister(@RequestBody SendEmailRequest request) throws MessagingException {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .message("Send otp to: " + request.getEmail())
                .result(service.classifyBeforeSendEmail(request))
                .build();
    }
}
