package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.AccountCreationRequest;
import com.example.webchiasetailieu.dto.request.AccountUpdateRequest;
import com.example.webchiasetailieu.dto.request.SendEmailRequest;
import com.example.webchiasetailieu.dto.request.UpdatePassword;
import com.example.webchiasetailieu.dto.response.AccountResponse;
import com.example.webchiasetailieu.dto.response.RoleResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.enums.EmailType;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.RoleRepository;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AccountService {
    AccountRepository accountRepository;
    RoleRepository roleRepository;
    MailService mailService;
    PasswordEncoder passwordEncoder;
    RoleService roleService;

    public enum BanType {
        TEMPORARY_10_DAYS,
        TEMPORARY_30_DAYS,
        PERMANENT
    }

    //public
    public AccountResponse createRequest(AccountCreationRequest accountRequest) throws MessagingException {
        if(accountRepository.existsByEmail(accountRequest.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        if(accountRepository.existsByName(accountRequest.getName()))
            throw new AppException(ErrorCode.USERNAME_EXISTED);

        if(!mailService.classifyBeforeSendEmail(SendEmailRequest.builder()
                        .email(accountRequest.getEmail())
                        .emailType(EmailType.REGISTER)
                .build()))
            throw new AppException(ErrorCode.FAILED_TO_SENT_EMAIL);
        if(Integer.parseInt(accountRequest.getOtp()) != 123456)
            throw new AppException(ErrorCode.OTP_INCORRECT);

        Account account = Account.builder()
                .email(accountRequest.getEmail())
                .password(passwordEncoder.encode(accountRequest.getPassword()))
                .points(20)
                .name(accountRequest.getName())
                .roles(new HashSet<>(roleRepository.findAllById(List.of("USER"))))
                .build();

        return convertToResponse(accountRepository.save(account));
    }

    @PreAuthorize("hasAuthority('VIEW_ACCOUNT')")
    public AccountResponse getMyInfo(){
        return convertToResponse(getAccountFromContext());
    }

    @PreAuthorize("hasAuthority('EDIT_ACCOUNT')")
    public AccountResponse edit(AccountUpdateRequest accountUpdateRequest) {
        Account account = getAccountFromContext();

        if(accountUpdateRequest.getName() != null)
            account.setName(accountUpdateRequest.getName());

        return convertToResponse(accountRepository.save(account));
    }

    @PreAuthorize("hasAuthority('CHANGE_PASSWORD')")
    public AccountResponse updatePassword(UpdatePassword request) {
        Account account = getAccountFromContext();

        if(!passwordEncoder.matches(request.getOldPassword(), account.getPassword()))
            throw new AppException(ErrorCode.PASSWORD_NOT_CORRECT);
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));

        return convertToResponse(accountRepository.save(account));
    }

    @PreAuthorize("hasRole('USER')")
    public String forgetPassword(String newPass) throws MessagingException{
        boolean check = mailService.classifyBeforeSendEmail(SendEmailRequest.builder()
                        .email(getAccountFromContext().getEmail())
                        .emailType(EmailType.FORGOT_PASSWORD)
                        .accountName(getAccountFromContext().getName())
                        .otp("123456")
                .build());
        if(!check) throw new AppException(ErrorCode.SEND_EMAIL_FAILED);

        Account account = getAccountFromContext();
        account.setPassword(passwordEncoder.encode(newPass));
        accountRepository.save(account);

        return "Reset password successfully!";
    }

    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse updateAccount(String id, AccountUpdateRequest accountUpdateRequest) {
        Account account = accountRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(accountUpdateRequest.getName() != null)
            account.setName(accountUpdateRequest.getName());

        if(accountUpdateRequest.getPoints() != null)
            account.setPoints(accountUpdateRequest.getPoints());

        if(accountUpdateRequest.getPassword() != null)
            account.setPassword(passwordEncoder.encode(accountUpdateRequest.getPassword()));

        if(accountUpdateRequest.getRoles() != null){
            var roles = roleRepository.findAllById(accountUpdateRequest.getRoles());
            account.setRoles(new HashSet<>(roles));
        }

        return convertToResponse(accountRepository.save(account));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<Account> getAllAccounts() {
        log.info("Get all accounts");
        if(accountRepository.findAll().isEmpty())
            throw new AppException(ErrorCode.ACCOUNT_EMPTY);
        else return accountRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<Account> findAccountsByKeyword(String keyword) {
        log.info("Get all accounts by keyword");
        if(accountRepository.findAccountByKeyWord(keyword).isEmpty())
            throw new AppException(ErrorCode.ACCOUNT_EMPTY);
        else return accountRepository.findAccountByKeyWord(keyword);
    }

    //@PostAuthorize("returnObject.email == authentication.name")
    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse getAccountById(String id) {
        log.info("Get account by id: {}", id);
        Account account = accountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return convertToResponse(account);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String deleteAccount(String id) {
        if(!accountRepository.existsById(id))
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        else{
            accountRepository.deleteById(id);
            if(accountRepository.existsById(id))
                return "Failed to delete account";
            else return "Delete successfully";
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String banAccount(String id, BanType banType) {
        Account account = accountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(account.isBanned())
            throw new AppException(ErrorCode.ACCOUNT_BANNED);

        account.setBanned(true);

        switch (banType) {
            case TEMPORARY_10_DAYS -> account.setBanUntil(LocalDateTime.now().plusDays(10));
            case TEMPORARY_30_DAYS -> account.setBanUntil(LocalDateTime.now().plusDays(30));
            case PERMANENT -> account.setBanUntil(null); // null nghĩa là cấm vĩnh viễn
        }

        accountRepository.save(account);
        return "Ban account successfully for " + banType;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String unbanAccount(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!account.isBanned()) {
            return "This account is not banned.";
        }

        account.setBanned(false);
        account.setBanUntil(null);
        accountRepository.save(account);

        return "Account has been unbanned.";
    }

    public void rewardPoint(String id, int point){
        Account account = accountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        account.setPoints(account.getPoints() + point);
        accountRepository.save(account);
    }

    private AccountResponse convertToResponse(Account account) {
        Set<RoleResponse> roleResponses = account.getRoles().stream()
                .map(roleService::convertToResponse)
                .collect(Collectors.toSet());

        return AccountResponse.builder()
                .name(account.getName())
                .email(account.getEmail())
                .points(account.getPoints())
                .roles(roleResponses)
                .build();
    }

    private Account getAccountFromContext(){
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        return accountRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
