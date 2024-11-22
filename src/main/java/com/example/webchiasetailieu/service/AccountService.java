package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.*;
import com.example.webchiasetailieu.dto.response.AccountResponse;
import com.example.webchiasetailieu.dto.response.MonthlyRegistrationCountResponse;
import com.example.webchiasetailieu.dto.response.RoleResponse;
import com.example.webchiasetailieu.dto.response.WeeklyRegistrationCountResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.enums.NotificationType;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
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

        accountRepository.save(account);

        notificationService.notify(NotificationCreationRequest.builder()
                        .type(NotificationType.REGISTER)
                        .accountId(account.getId())
                .build());

        return convertToResponse(account);
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

    //public
    public String forgetPassword(ForgotPasswordRequest request){
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        account.setPassword(passwordEncoder.encode(request.getNewPass()));
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

    @PreAuthorize("hasRole('ADMIN')")
    public List<Long> getRegistrationsByDayOfWeek() {
        LocalDate startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY); // Lấy đầu tuần
        LocalDate endOfWeek = startOfWeek.plusDays(7); // Lấy cuối tuần

        // Lấy danh sách các tài khoản đăng ký trong tuần hiện tại
        List<Account> accounts = accountRepository.findAllByWeek(startOfWeek, endOfWeek);

        // Khởi tạo danh sách đếm số lượt đăng ký trong 7 ngày
        List<Long> registrations = new ArrayList<>(Collections.nCopies(7, 0L)); // 7 ngày trong tuần

        for (Account account : accounts) {
            int dayOfWeek = account.getRegisterDate().getDayOfWeek().getValue(); // 1 (Thứ Hai) -> 7 (Chủ Nhật)
            registrations.set(dayOfWeek - 1, registrations.get(dayOfWeek - 1) + 1);
        }

        return registrations;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<WeeklyRegistrationCountResponse> getWeeklyRegistrationsInCurrentMonth() {
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // Lấy tất cả tài khoản trong tháng hiện tại
        List<Account> accounts = accountRepository.findAllByMonthAndYear(currentMonth, currentYear);

        // Chia tài khoản theo tuần trong tháng
        Map<Integer, Long> weeklyCounts = accounts.stream()
                .collect(Collectors.groupingBy(
                        account -> {
                            // Tính tuần của tháng (tuần trong tháng, không phải tuần của năm)
                            LocalDate registerDate = account.getRegisterDate();
                            int weekOfMonth = (registerDate.getDayOfMonth() - 1) / 7 + 1;
                            return weekOfMonth;
                        },
                        Collectors.counting()
                ));

        // Tạo đối tượng WeeklyRegistrationCountResponse cho từng tuần
        List<WeeklyRegistrationCountResponse> response = new ArrayList<>();
        for (int week = 1; week <= 4; week++) {  // Giả sử tháng này có 4 tuần
            long count = weeklyCounts.getOrDefault(week, 0L);

            // Tính ngày bắt đầu và ngày kết thúc của tuần
            LocalDate startOfWeek = getStartOfWeek(week, currentMonth, currentYear);
            LocalDate endOfWeek = startOfWeek.plusDays(6);

            response.add(new WeeklyRegistrationCountResponse(week, count, startOfWeek, endOfWeek));
        }

        // Sắp xếp theo tuần
        return response.stream()
                .sorted(Comparator.comparing(WeeklyRegistrationCountResponse::getWeek))
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<MonthlyRegistrationCountResponse> getMonthlyRegistrationsInCurrentYear() {
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();

        // Lấy tất cả tài khoản trong năm hiện tại
        List<Account> accounts = accountRepository.findAllByYear(currentYear);

        // Chia tài khoản theo tháng trong năm
        Map<Integer, Long> monthlyCounts = accounts.stream()
                .collect(Collectors.groupingBy(
                        account -> account.getRegisterDate().getMonthValue(),  // Lấy tháng của ngày đăng ký
                        Collectors.counting()
                ));

        // Tạo đối tượng MonthlyRegistrationCountResponse cho từng tháng
        List<MonthlyRegistrationCountResponse> response = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {  // 12 tháng trong năm
            long count = monthlyCounts.getOrDefault(month, 0L);

            response.add(new MonthlyRegistrationCountResponse(month, count));
        }

        // Sắp xếp theo tháng
        return response.stream()
                .sorted(Comparator.comparing(MonthlyRegistrationCountResponse::getMonth))
                .collect(Collectors.toList());
    }

    // Phương thức tính ngày bắt đầu của tuần trong tháng
    private LocalDate getStartOfWeek(int week, int month, int year) {
        LocalDate firstDayOfMonth = LocalDate.of(year, month, 1);

        // Tính số ngày cần thêm để có ngày bắt đầu của tuần
        int daysToAdd = (week - 1) * 7;
        return firstDayOfMonth.plusDays(daysToAdd);
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
