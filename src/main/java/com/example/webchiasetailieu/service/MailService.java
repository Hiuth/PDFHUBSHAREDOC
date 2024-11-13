package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

//    @Autowired
//    private OTPService otpService;
    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }

    public boolean sendMail(String to, String subject, String content) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        message.setFrom("pdfHub5shareDoc@gmail.com");  // Đảm bảo email gửi là từ tài khoản đã cấu hình

        System.out.println("Sending email to: " + to);
        try {
            mailSender.send(message);
            System.out.println("Email sent successfully!");
            return true;
        } catch (MailException e) {
            e.printStackTrace();
            System.out.println("Failed to send email: " + e.getMessage());
            return false;
        }  // Thêm dòng này để thực sự gửi email
    }

    public boolean sendOTPMail(String email){
        if (!isValidEmail(email)) {
            System.out.println("Email không hợp lệ: " + email);
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom("pdfHub5shareDoc@gmail.com");
        message.setSubject("Ma OTP");
        message.setText("Ma dang ky tai khoan pdfHub: 123456" /*+ otpService.generateOTP()*/);

        try {
            mailSender.send(message);
            System.out.println("Email sent successfully!");
            return true;
        } catch (MailException e) {
            e.printStackTrace();
            System.out.println("Failed to send email: " + e.getMessage());
            return false;
        }
    }
}
