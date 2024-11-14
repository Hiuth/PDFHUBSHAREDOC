package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.SendEmailRequest;
import com.example.webchiasetailieu.dto.response.SendEmailResponse;
import com.example.webchiasetailieu.enums.EmailType;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailService {
    JavaMailSender mailSender;

    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        Pattern pattern = Pattern.compile(emailRegex);
        return !pattern.matcher(email).matches();
    }

    public boolean classifyBeforeSendEmail(SendEmailRequest request) {
        if(request.getEmailType() == EmailType.DOWNLOAD) {
            SendEmailResponse response = SendEmailResponse.builder()
                    .subject("Tài liệu của bạn có một lượt tải")
                    .body("Tài liệu của bạn có một lượt tải")
                    .build();
            sendEmail(response, request);
            return true;
        }
        else if(request.getEmailType() == EmailType.REGISTER){
            SendEmailResponse response = SendEmailResponse.builder()
                    .subject("Mã đăng ký tài khoản")
                    .body("Mã đăng ký tài khoản của bạn là: 123456")
                    .build();
            sendEmail(response, request);
            return true;
        }
        else if(request.getEmailType() == EmailType.FORGOT_PASSWORD){
            SendEmailResponse response = SendEmailResponse.builder()
                    .subject("Mã reset password")
                    .body("Mã reset password của bạn là: 123456")
                    .build();
            sendEmail(response, request);
            return true;
        }
        else return false;
    }

    private void sendEmail(SendEmailResponse response, SendEmailRequest request) {
        if (isValidEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getEmail());
        message.setFrom("pdfHub5shareDoc@gmail.com");
        message.setSubject(response.getSubject());
        message.setText(response.getBody());

        try {
            mailSender.send(message);
            log.info("Email sent successfully to '{}', subject: '{}'", request.getEmail(), response.getSubject());
        } catch (MailException e) {
            log.error("An error occurred while doing something", e);
            log.error("Failed to sent email: {}", e.getMessage(), e);
        }
    }
}
