package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.OTPCreationRequest;
import com.example.webchiasetailieu.dto.request.ValidationOTPRequest;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OTPService {
    SecureRandom random = new SecureRandom();
    Map<String, OTPCreationRequest> otpStorage = new HashMap<>();

    public String generateSecureOTP(String email) {
        long otpValidityDuration = 3L * 60 * 1000; // 3 minutes
        String rawOtp = generateOTP();

        String hashedOtp = hash(rawOtp);

        long expiryTime = System.currentTimeMillis() + otpValidityDuration;
        otpStorage.put(email, new OTPCreationRequest(hashedOtp, expiryTime));

        return rawOtp;
    }

    public boolean validateSecureOTP(ValidationOTPRequest request) {
        if (!otpStorage.containsKey(request.getEmail())) {
            return false;
        }

        OTPCreationRequest otpDetails = otpStorage.get(request.getEmail());
        if (System.currentTimeMillis() > otpDetails.getExpiryTime()) {
            otpStorage.remove(request.getEmail()); // Xóa OTP đã hết hạn
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        String hashedInputOtp = hash(request.getOtp());

        return hashedInputOtp.equals(otpDetails.getOtp());
    }

    private String generateOTP() {
        int otpLength = 6;
        StringBuilder otp = new StringBuilder();
        for(int i = 0; i< otpLength; i++){
            otp.append(random.nextInt(10));
        }

        return otp.toString();
    }

    private String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();

        } catch (Exception ex) {
            log.warn(ex.getMessage());
            throw new AppException(ErrorCode.ERROR_HASHING);
        }
    }
}
