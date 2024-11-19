package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.CreateMyPerInfoRequest;
import com.example.webchiasetailieu.dto.request.UpdatePerInfoRequest;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PersonalInformationService {
    PersonalInformationRepository repository;
    AccountRepository accountRepository;
    DriveService driveService;
    AccountService accountService;

    @PreAuthorize("hasAuthority('ADD_PER_INFO')")
    public PerInfoResponse create(CreateMyPerInfoRequest request) {
        Account account = accountService.getAccountFromAuthentication();
        if(repository.existsByAccount_Id(account.getId()))
            throw new AppException(ErrorCode.PER_INFO_EXISTED);
        PersonalInformation personalInformation = PersonalInformation.builder()
                .fullName(request.getFullName())
                .gender(request.getGender())
                .birthday(request.getBirthday())
                .account(account)
                .build();

        return convertToResponse(repository.save(personalInformation));
    }

    @PreAuthorize("hasAuthority('ADD_PER_INFO')")
    public PerInfoResponse update(UpdatePerInfoRequest request) {
        PersonalInformation personalInformation = getPerInfoFromContext();
        if(request.getFullName() != null)
            personalInformation.setFullName(request.getFullName());

        if(request.getGender() != null)
            personalInformation.setGender(request.getGender());

        if(request.getBirthday() != null)
            personalInformation.setBirthday(request.getBirthday());

        return convertToResponse(repository.save(personalInformation));
    }

    @PreAuthorize("hasAuthority('VIEW_PER_INFO')")
    public PerInfoResponse viewMyPerInfo() throws AppException {
        return convertToResponse(getPerInfoFromContext());
    }

    @PreAuthorize("hasAuthority('UP_AVATAR')")
    public PerInfoResponse saveMyAvatar(MultipartFile file) throws IOException, GeneralSecurityException {
        PersonalInformation personalInformation = getPerInfoFromContext();
        personalInformation.setAvatar(upImage(file).getUrl());
        return convertToResponse(repository.save(personalInformation));
    }

    private PersonalInformation getPerInfoFromContext() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        Account account = accountRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return repository.findByAccountId(account.getId());
    }

    private DriveResponse upImage(MultipartFile file) throws IOException, GeneralSecurityException {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.contains(".")) {
            throw new IllegalArgumentException("File must have a valid name with an extension.");
        }
        String fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf("."));
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        File tempFile = File.createTempFile(fileNameWithoutExtension, fileExtension);
        file.transferTo(tempFile);
        return driveService.uploadImagesToDrive(tempFile);
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
                .build();
    }
}
