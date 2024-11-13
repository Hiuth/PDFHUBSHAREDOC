package com.example.webchiasetailieu.configuration;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.jasypt.util.text.AES256TextEncryptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Component
public class JsonEncryptorUtil {

    //    @NonFinal
//    @Value("${json-encrypt-password}")
    protected String password = "qUIO01I4tQtECy3nFMP4kI1RK27VqetVfCMf+SQJpnL+xVN9Cv1w7HCkvEPsGTVW";

    public void encryptJsonFile(String filePath, String encryptedFilePath) {
        try {
            String content = new String(Files.readAllBytes(Paths.get(filePath)));
            log.info("Mật khẩu mã hóa: " + password); // In ra giá trị của password để kiểm tra
            if (password == null || password.trim().isEmpty()) {
                log.error("Mật khẩu mã hóa không hợp lệ.");
                return;
            }

            AES256TextEncryptor encryptor = new AES256TextEncryptor();
            encryptor.setPassword(password);
            String encryptedContent = encryptor.encrypt(content);

            Files.write(Paths.get(encryptedFilePath), encryptedContent.getBytes());
            log.info("File đã được mã hóa thành công: " + encryptedFilePath);

            try {
                Files.delete(Paths.get(filePath));
                log.info("File gốc chưa mã hóa đã bị xóa: " + filePath);
            } catch (IOException e) {
                log.error("Lỗi khi xóa file gốc chưa mã hóa: " + filePath, e);
            }
        } catch (IOException e) {
            log.error("Lỗi khi đọc hoặc ghi file: ", e);
        }
    }

    public String decryptJsonFile(String encryptedFilePath) {
        try {
            String encryptedContent = new String(Files.readAllBytes(Paths.get(encryptedFilePath)));

            AES256TextEncryptor decryptor = new AES256TextEncryptor();
            decryptor.setPassword(password);
            return decryptor.decrypt(encryptedContent);

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}

