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
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;
import org.springframework.core.io.FileSystemResource;

import java.io.File;

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

        switch (request.getEmailType()) {
            case DOWNLOAD:
                subject = "Tài liệu của bạn có lượt tải mới";
                body = String.format("""
                        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
                                               <div style="max-width: 620px; margin: 0 auto; background-color: #fff; border: 1px solid #D82B8A; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                                   <!-- Header -->
                                                   <div style="background: #D82B8A; color: #fff; text-align: center; padding: 20px;">
                                                       <img src="cid:logoImage" alt="PDF Hub Logo" style="max-width: 150px; margin-bottom: 10px; background-color: #ececec; padding: 8px 10px; border-radius: 10px;">
                                                       <h1 style="margin: 0; font-size: 24px;">Thông báo về lượt tải</h1>
                                                   </div>
                                                   <!-- Body -->
                                                   <div style="padding: 20px; text-align: center;">
                                                       <p style="color: #333; font-size: 16px; margin-bottom: 10px">Chào <strong>%s</strong>,</p>
                                                       <p style="color: #333; font-size: 14px; margin-bottom: 20px;">
                                                           Tài liệu <strong>%s</strong> của bạn vừa nhận được lượt tải mới, nhờ đó bạn được thưởng thêm xu! <br>Hãy truy cập web để xem ngay!
                                                       </p>
                                                   </div>
                                                   <!-- Footer -->
                                                   <div style="background-color: #f9f9f9; color: #555; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #D82B8A;">
                                                       Nếu bạn cần hỗ trợ, vui lòng liên hệ <a href="mailto:pdfHub5shareDoc@gmail.com" style="color: #D82B8A;">pdfHub5shareDoc@gmail.com</a>.
                                                       <br>© 2024 SOSGROUP. Tất cả các quyền được bảo lưu.
                                                   </div>
                                               </div>
                                           </body>
            """, request.getCreateBy(), request.getDocName());
                break;

            case REGISTER:
                if(accountRepository.existsByEmail(request.getEmail()))
                    throw new AppException(ErrorCode.EMAIL_EXISTED);
                subject = "Mã đăng ký tài khoản";
                body = String.format("""
                        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
                                <div style="max-width: 620px; margin: 0 auto; background-color: #fff; border: 1px solid #D82B8A; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <div style="background: #D82B8A; color: #fff; text-align: center; padding: 20px;">
                                        <img src="cid:logoImage" alt="PDF Hub Logo" style="max-width: 150px; margin-bottom: 10px; background-color: #ececec; padding: 8px 10px; border-radius: 10px;">
                                        <h1 style="margin: 0; font-size: 24px;">Xác nhận tài khoản</h1>
                                    </div>
                                    <!-- Body -->
                                    <div style="padding: 20px; text-align: center;">
                                        <p style="color: #333; font-size: 16px;">Chào khách hàng mới,</p>
                                        <p style="color: #333; font-size: 14px; margin-bottom: 20px;">
                                            Cảm ơn bạn đã đăng ký tài khoản trên hệ thống của chúng tôi. Vui lòng sử dụng mã OTP dưới đây để xác nhận tài khoản:
                                        </p>
                                        <div style="background-color: #f9f9f9; border: 2px dashed #D82B8A; display: inline-block; padding: 15px 30px; border-radius: 8px; margin-bottom: 20px;">
                                            <span style="font-size: 24px; font-weight: bold; color: #D82B8A;">%s</span>
                                        </div>
                                        <p style="color: #333; font-size: 14px; margin-bottom: 20px;">
                                            Mã OTP này có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
                                        </p>
                                    </div>
                                    <!-- Footer -->
                                    <div style="background-color: #f9f9f9; color: #555; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #D82B8A;">
                                        Nếu bạn cần hỗ trợ, vui lòng liên hệ <a href="mailto:pdfHub5shareDoc@gmail.com" style="color: #D82B8A;">pdfHub5shareDoc@gmail.com</a>.
                                        <br>© 2024 SOSGROUP. Tất cả các quyền được bảo lưu.
                                    </div>
                                </div>
                            </body>
                    """, otp);
                break;

            case FORGOT_PASSWORD:
                Account account = accountRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                subject = "Mã reset password";
                body = String.format("""
                        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
                            <div style="max-width: 620px; margin: 0 auto; background-color: #fff; border: 1px solid #D82B8A; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <div style="background: #D82B8A; color: #fff; text-align: center; padding: 20px;">
                                    <img src="cid:logoImage" alt="PDF Hub Logo" style="max-width: 150px; margin-bottom: 10px; background-color: #ececec; padding: 8px 10px; border-radius: 10px;">
                                    <h1 style="margin: 0; font-size: 24px;">Đặt lại mật khẩu</h1>
                                </div>
                        
                                <!-- Body -->
                                <div style="padding: 20px; text-align: center;">
                                    <p style="color: #333; font-size: 16px;">Chào <strong>%s</strong>,</p>
                                    <p style="color: #333; font-size: 14px; margin-bottom: 20px;">
                                        Bạn đã gửi yêu cầu đặt lại mật khẩu cho hệ thống của chúng tôi, đây là mã OTP dùng để xác thực yêu cầu của bạn
                                    </p>
                                    <div style="background-color: #f9f9f9; border: 2px dashed #D82B8A; display: inline-block; padding: 15px 30px; border-radius: 8px; margin-bottom: 20px;">
                                        <span style="font-size: 24px; font-weight: bold; color: #D82B8A;">%s</span>
                                    </div>
                                    <p style="color: #333; font-size: 14px; margin-bottom: 20px;">
                                        Mã OTP này có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
                                    </p>
                                </div>
                        
                                <!-- Footer -->
                                <div style="background-color: #f9f9f9; color: #555; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #D82B8A;">
                                    Nếu bạn cần hỗ trợ, vui lòng liên hệ <a href="mailto:pdfHub5shareDoc@gmail.com" style="color: #D82B8A;">pdfHub5shareDoc@gmail.com</a>.
                                    <br>© 2024 SOSGROUP. Tất cả các quyền được bảo lưu.
                                </div>
                            </div>
                        </body>
                        """,account.getName(), otp);
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

            // Đính kèm ảnh vào email bằng CID
            String logoPath = "src/main/resources/static/images/pdfhub.png"; // Đường dẫn ảnh
            FileSystemResource res = new FileSystemResource(new File(logoPath));
            helper.addInline("logoImage", res); // CID là 'logoImage'

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
}
