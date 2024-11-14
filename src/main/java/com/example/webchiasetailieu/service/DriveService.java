package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.configuration.JsonEncryptorUtil;
import com.example.webchiasetailieu.dto.response.DriveResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.*;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DriveService {
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private String getPathToGoogleCredentials() {
        String currentDirectory = System.getProperty("user.dir");
        Path encryptedFilePath = Paths.get(currentDirectory, "drive.json.enc");
        Path tempDecryptedFilePath = Paths.get(currentDirectory, "decrypted_drive.json");
        String decryptedContent = null;

        if (!Files.exists(encryptedFilePath)) {
            log.error("File không tồn tại: " + encryptedFilePath);
            return null;
        }

        if(!Files.exists(tempDecryptedFilePath)) {
            JsonEncryptorUtil jsonEncryptorUtil = new JsonEncryptorUtil();
            decryptedContent = jsonEncryptorUtil.decryptJsonFile(encryptedFilePath.toString());
        }

        if (decryptedContent != null) {
            log.info("Giải mã thành công");

            try {
                Files.write(tempDecryptedFilePath, decryptedContent.getBytes());
                log.info("File giải mã đã được lưu tạm tại: " + tempDecryptedFilePath);
                return tempDecryptedFilePath.toString();
            } catch (IOException e) {
                log.error("Lỗi khi ghi file giải mã: " + tempDecryptedFilePath, e);
                return null;
            }
        } else {
            log.error("Lỗi khi giải mã file: " + encryptedFilePath);
            return null;
        }
    }


    public boolean downloadFile(String url, String fileType, String name) {
        try {
            String userHome = System.getProperty("user.home");
            String fileName = name + ".";
            Path downloadPath = Paths.get(userHome, "Downloads", fileName + fileType);

            URL downloadUrl = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) downloadUrl.openConnection();
            connection.setRequestMethod("GET");

            if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                InputStream inputStream = connection.getInputStream();

                Files.copy(inputStream, downloadPath, StandardCopyOption.REPLACE_EXISTING);
                log.info("File saved to: " + downloadPath);

                inputStream.close();
                return true;
            } else {
                log.warn("Failed to download file. Server returned code: " + connection.getResponseCode());
                return false;
            }
        } catch (IOException e) {
            e.printStackTrace();
            log.warn("An error occurred during download: " + e.getMessage());
            return false;
        }
    }

    public DriveResponse uploadImagesToDrive(File file) throws GeneralSecurityException, IOException {
        DriveResponse res = new DriveResponse();

        try{
            String folderId = "16oGkqM_IA1ZD_FqM8Uc8zcm72yGURz4X";
            Drive drive = createDriveService();
            com.google.api.services.drive.model.File fileMetadata = new com.google.api.services.drive.model.File();
            fileMetadata.setName(file.getName());
            fileMetadata.setParents(Collections.singletonList(folderId));
            FileContent mediaContent = new FileContent("image/jpeg", file);
            com.google.api.services.drive.model.File uploadedFile = drive.files().create(fileMetadata, mediaContent)
                    .setFields("id").execute();
            String url = "https://drive.google.com/file/d/"+uploadedFile.getId()+"/view";
            cleanUp(file.toPath());
            res.setStatus(200);
            res.setMessage("File uploaded successfully");
            res.setUrl(url);
        }
        catch (Exception e){
            log.warn(e.getMessage());
            res.setStatus(500);
            res.setMessage(e.getMessage());
        }

        return res;
    }

    public DriveResponse uploadFileToDrive(File file) {
        DriveResponse res = new DriveResponse();

        try{
            String folderId = "1Te50W56VmP_u8Q0_zUf0mFSXfZVXdNk4";
            Drive drive = createDriveService();
            com.google.api.services.drive.model.File fileMetadata = new com.google.api.services.drive.model.File();
            fileMetadata.setName(file.getName());
            fileMetadata.setParents(Collections.singletonList(folderId));

            FileContent mediaContent = new FileContent("application/pdf", file);
            com.google.api.services.drive.model.File uploadedFile = drive.files().create(fileMetadata, mediaContent)
                    .setFields("id").execute();

            String url = "https://drive.google.com/uc?export=view&id=" + uploadedFile.getId();
            cleanUp(file.toPath());

            res.setStatus(200);
            res.setMessage("File uploaded successfully");
            res.setUrl(url);
        }
        catch (Exception e){
            log.warn(e.getMessage());
            res.setStatus(500);
            res.setMessage(e.getMessage());
        }

        return res;
    }

    public void cleanUp(Path path) throws IOException {
        Files.delete(path);
    }

    public DriveResponse deleteFileFromDrive(String fileId) {
        DriveResponse res = new DriveResponse();

        try {
            Drive drive = createDriveService();
            drive.files().delete(fileId).execute();

            res.setStatus(200);
            res.setMessage("File deleted successfully");
        } catch (Exception e) {
            log.warn(e.getMessage());
            res.setStatus(500);
            res.setMessage("Failed to delete file: " + e.getMessage());
        }

        return res;
    }

    private Drive createDriveService() throws GeneralSecurityException, IOException {
        String decryptedFilePath = getPathToGoogleCredentials();
        if (decryptedFilePath == null) {
            throw new IOException("Không thể giải mã file thông tin đăng nhập Google.");
        }

        GoogleCredential credentials = GoogleCredential.fromStream(new FileInputStream(decryptedFilePath))
                .createScoped(Collections.singleton(DriveScopes.DRIVE));

        // Xóa file .json tạm thời sau khi sử dụng
        try {
            Files.delete(Paths.get(decryptedFilePath));
            log.info("File giải mã tạm thời đã bị xóa: " + decryptedFilePath);
        } catch (IOException e) {
            log.error("Lỗi khi xóa file giải mã tạm thời: " + decryptedFilePath, e);
        }

        return new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credentials).build();
    }
}
