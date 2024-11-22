package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.SendEmailRequest;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailService{
    JavaMailSender mailSender;
    OTPService otpService;
    AccountRepository accountRepository;

    public boolean classifyBeforeSendEmail(SendEmailRequest request) throws MessagingException {
        String subject;
        String body;
        String otp = otpService.generateSecureOTP(request.getEmail());

        if(accountRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTED);

        switch (request.getEmailType()) {
            case DOWNLOAD:
                subject = "Tài liệu của bạn có một lượt tải";
                body = String.format("""
                        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; margin: 20px auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                                <tr>
                                    <td align="center" bgcolor="#4CAF50" style="padding: 20px; color: #ffffff;">
                                        <h1>PDF Hub</h1>
                                        <p>Thông báo lượt tải tài liệu</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px;">
                                        <p>Xin chào <strong style="color: #4CAF50;">%s</strong>,</p>
                                        <p>Tài liệu của bạn với tiêu đề <strong>%s</strong> vừa nhận được một lượt tải xuống mới!</p>
                                        <p>Cảm ơn bạn đã đóng góp tài liệu cho cộng đồng. Tiếp tục chia sẻ thêm nhiều tài liệu hữu ích nhé!</p>
                                    </td>
                                </tr>
                            </table>
                        </body>
            """, request.getCreateBy(), request.getDocName());
                break;

            case REGISTER:
                subject = "Mã đăng ký tài khoản";
                body = String.format("""
                        <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                                <h1 style="color: #4CAF50; text-align: center;">Account Verification</h1>
                                <p>Dear Customer,</p>
                                <p>Thank you for registering for an account with us. To complete your registration, please use the following OTP:</p>
                                <p style="font-size: 24px; font-weight: bold; text-align: center; color: #4CAF50;">%s</p>
                                <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
                            </div>
                        </body>
                        </html>
                    """, otp);
                break;

            case FORGOT_PASSWORD:
                subject = "Mã reset password";
                body = String.format("""
                        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0;">
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                <div style="text-align: center; background-color: #4CAF50; color: #ffffff; padding: 20px; border-radius: 10px 10px 0 0;">
                                    <h1 style="margin: 0; font-size: 24px;">Reset Password</h1>
                                    <p style="margin: 5px 0 0; font-size: 16px;">Your request to reset your password</p>
                                </div>
                                <div style="padding: 20px; text-align: center;">
                                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
                                    Hello <strong style="color: #4CAF50;">%s</strong>,
                                    </p>
                                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
                                    You recently requested to reset your password. Please use the OTP below to complete the process:
                                    </p>
                                    <div style="font-size: 24px; font-weight: bold; color: #4CAF50; margin: 20px 0;">%s</div>
                                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
                                    This OTP is valid for the next <strong>10 minutes</strong>. Please do not share it with anyone.
                                    </p>
                                    <p style="font-size: 16px; line-height: 1.6; margin: 0;">
                                    If you did not request a password reset, please ignore this email or contact our support team.
                                    </p>
                                </div>
                                <div style="text-align: center; font-size: 12px; color: #777; padding: 15px; border-top: 1px solid #ddd;">
                                    <p style="margin: 0;">
                                    If you have any questions, feel free to contact us at
                                    <a href="mailto:support@example.com" style="color: #4CAF50; text-decoration: none;">support@example.com</a>.
                                    </p>
                                    <p style="margin: 0;">&copy; 2024 PDF Hub. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        """,getEmailFromAuthentication().getName() , otp);
                break;

            default:
                return false;
        }

        request.setSubject(subject);
        request.setBody(body);

        sendEmail(request);
        return true;
    }

    private void sendEmail(SendEmailRequest request) throws MessagingException {
        validateEmail(request.getEmail());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(request.getEmail());
            helper.setFrom("pdfHub5shareDoc@gmail.com");
            helper.setSubject(request.getSubject());
            helper.setText(request.getBody(), true);

            mailSender.send(message);
            log.info("Email sent successfully to '{}', subject: '{}'", request.getEmail(), request.getSubject());
        } catch (MailException e) {
            log.error("Failed to send email to '{}': {}", request.getEmail(), e.getMessage(), e);
            throw new AppException(ErrorCode.FAILED_TO_SENT_EMAIL);
        }
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }

    private void validateEmail(String email) {
        if (email == null || !isValidEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }
    }

    private Account getEmailFromAuthentication(){
        return accountRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
