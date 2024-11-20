package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.*;
import com.example.webchiasetailieu.dto.response.AccountResponse;
import com.example.webchiasetailieu.dto.response.RoleResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.enums.EmailType;
import com.example.webchiasetailieu.enums.NotificationType;
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
    PasswordEncoder passwordEncoder;
    RoleService roleService;
    OTPService otpService;
    NotificationService notificationService;

    public enum BanType {
        TEMPORARY_10_DAYS,
        TEMPORARY_30_DAYS,
        PERMANENT
    }

//        public
    public AccountResponse createRequest(AccountCreationRequest request) {
        if(accountRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        if(accountRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.USERNAME_EXISTED);

        Account account = Account.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .points(20)
                .name(request.getName())
                .roles(new HashSet<>(roleRepository.findAllById(List.of("USER"))))
                .build();

        notificationService.notify(NotificationCreationRequest.builder()
                        .type(NotificationType.REGISTER)
                        .accountId(account.getId())
                .build());

        return convertToResponse(accountRepository.save(account));
    }

    @PreAuthorize("hasAuthority('VIEW_ACCOUNT')")
    public AccountResponse getMyInfo(){
        return convertToResponse(getAccountFromAuthentication());
    }

    @PreAuthorize("hasAuthority('EDIT_ACCOUNT')")
    public AccountResponse edit(AccountUpdateRequest accountUpdateRequest) {
        Account account = getAccountFromAuthentication();

        if(accountUpdateRequest.getName() != null)
            account.setName(accountUpdateRequest.getName());

        return convertToResponse(accountRepository.save(account));
    }

    @PreAuthorize("hasAuthority('CHANGE_PASSWORD')")
    public AccountResponse updatePassword(UpdatePassword request) {
        Account account = getAccountFromAuthentication();

        if(!passwordEncoder.matches(request.getOldPassword(), account.getPassword()))
            throw new AppException(ErrorCode.PASSWORD_NOT_CORRECT);
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));

        return convertToResponse(accountRepository.save(account));
    }

    @PreAuthorize("hasRole('USER')")
    public String forgetPassword(String newPass, String otp){
        Account account = getAccountFromAuthentication();
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
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(account.isBanned())
            throw new AppException(ErrorCode.ACCOUNT_BANNED);

        account.setBanned(true);

        switch (banType) {
            case TEMPORARY_10_DAYS -> account.setBanUntil(LocalDateTime.now().plusDays(10));
            case TEMPORARY_30_DAYS -> account.setBanUntil(LocalDateTime.now().plusDays(30));
            case PERMANENT -> account.setBanUntil(null); // null nghĩa là cấm vĩnh viễn
        }

        accountRepository.save(account);

        notificationService.notify(NotificationCreationRequest.builder()
                .type(NotificationType.ACCOUNT_LOCKED)
                .accountId(account.getId())
                .build());

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

    @PreAuthorize("hasRole('ADMIN')")
    public long numberOfAccounts() {
        return accountRepository.count();
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

    public Account getAccountFromAuthentication(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return accountRepository.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
