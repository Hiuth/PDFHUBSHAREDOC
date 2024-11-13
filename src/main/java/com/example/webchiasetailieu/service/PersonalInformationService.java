package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.PerInfoCreationRequest;
import com.example.webchiasetailieu.dto.request.PerInfoUpdateRequest;
import com.example.webchiasetailieu.dto.response.DriveResponse;
import com.example.webchiasetailieu.dto.response.PerInfoResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.PersonalInformation;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.PersonalInformationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PersonalInformationService {
    PersonalInformationRepository perRepository;
    AccountRepository accountRepository;
    DriveService driveService;

    @PreAuthorize("hasAuthority('EDIT_PER_INFO')")
    public PerInfoResponse addPersonalInformation(PerInfoCreationRequest request) {
        PersonalInformation personalInformation = getPerInfoFromContext();

        if(request.getFullName() != null)
            personalInformation.setFullName(request.getFullName());

        if(request.getGender() != null)
            personalInformation.setGender(request.getGender());

        if(request.getAvatar() != null)
            personalInformation.setAvatar(request.getAvatar());

        if(request.getBirthday() != null)
            personalInformation.setBirthday(request.getBirthday());

        return convertToResponse(perRepository.save(personalInformation));
    }

    @PreAuthorize("hasAuthority('VIEW_PERINFO')")
    public PerInfoResponse getMyPersonalInformation() {
        return convertToResponse(getPerInfoFromContext());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PerInfoResponse createPersonalInformation(PerInfoCreationRequest request) {
        Account account = accountRepository.findById(request.getAccount())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        PersonalInformation personalInformation = PersonalInformation.builder()
                .avatar(request.getAvatar())
                .birthday(request.getBirthday())
                .gender(request.getGender())
                .fullName(request.getFullName())
                .account(account)
                .build();

        return convertToResponse(perRepository.save(personalInformation));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PerInfoResponse getPersonalInformationById(String id) {
        return convertToResponse(perRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Personal Information not found")));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PerInfoResponse getPersonalInformationByAccountId(String AccountId) {
        if(!accountRepository.existsById(AccountId))
            throw new AppException(ErrorCode.USER_NOT_EXISTED);

        if(perRepository.findByAccountId(AccountId) == null)
            throw new AppException(ErrorCode.PERINFO_EMPTY);

        return convertToResponse(perRepository.findByAccountId(AccountId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<PersonalInformation> getAllPersonalInformation() {
        if(perRepository.findAll().isEmpty())
            throw new AppException(ErrorCode.PERSONAL_INFORMATION_EMPTY);
        else return perRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PerInfoResponse updatePersonalInformation(String id, PerInfoUpdateRequest request) {
        PersonalInformation personalInformation = perRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(request.getFullName() != null)
            personalInformation.setFullName(request.getFullName());

        if(request.getGender() != null)
            personalInformation.setGender(request.getGender());

        if(request.getAvatar() != null)
            personalInformation.setAvatar(request.getAvatar());

        if(request.getBirthday() != null)
            personalInformation.setBirthday(request.getBirthday());

        return convertToResponse(perRepository.save(personalInformation));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String deletePersonalInformation(String id) {
        if(!perRepository.existsById(id))
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        else{
            perRepository.deleteById(id);
            if(perRepository.existsById(id))
                return "Failed to delete account";
            else return "Delete successfully";
        }
    }

    @PreAuthorize("hasAuthority('UP_AVATAR')")
    public PerInfoResponse saveMyAvatar(MultipartFile file) throws IOException, GeneralSecurityException {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXISTED));
        PersonalInformation personalInformation = perRepository.findByAccountId(account.getId());
        personalInformation.setAvatar(upImage(file).getUrl());
        return convertToResponse(perRepository.save(personalInformation));
    }

    private PersonalInformation getPerInfoFromContext() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));
//        PersonalInformation personalInfo = perRepository.findByAccountId(account.getId());
//        System.out.println("Personal info: " + personalInfo);
        return perRepository.findByAccountId(account.getId());
    }

    private DriveResponse upImage(MultipartFile file) throws IOException, GeneralSecurityException {
        String originalFileName = file.getOriginalFilename();
        String fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf("."));
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        File tempFile = File.createTempFile(fileNameWithoutExtension, fileExtension);
        file.transferTo(tempFile);
        DriveResponse res = driveService.uploadImagesToDrive(tempFile);
        return res;
    }

    private PerInfoResponse convertToResponse(PersonalInformation perInfo) {
        return PerInfoResponse.builder()
                .fullName(perInfo.getFullName())
                .gender(perInfo.getGender())
                .avatar(perInfo.getAvatar())
                .birthday(perInfo.getBirthday())
                .email(perInfo.getAccount().getEmail())
                .username(perInfo.getAccount().getName())
                .points(perInfo.getAccount().getPoints())
                .accountId(perInfo.getAccount().getId())
//                .account(perInfo.getAccount())
                .build();
    }
}
