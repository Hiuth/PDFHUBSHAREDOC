package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.AccountCreationRequest;
import com.example.webchiasetailieu.dto.request.AccountUpdateRequest;
import com.example.webchiasetailieu.dto.request.ForgotPasswordRequest;
import com.example.webchiasetailieu.dto.request.UpdatePassword;
import com.example.webchiasetailieu.dto.response.AccountResponse;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.MonthlyRegistrationCountResponse;
import com.example.webchiasetailieu.dto.response.WeeklyRegistrationCountResponse;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.service.AccountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import com.example.webchiasetailieu.service.AccountService.BanType;

import java.util.List;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AccountController {
    AccountService accountService;

    @PostMapping
    ApiResponse<AccountResponse> createAccount(@RequestBody @Valid AccountCreationRequest account){
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.createRequest(account));
        return response;
    }

    @GetMapping()
    @MessageMapping("/allAccounts")
    @SendTo("/topic/accounts")
    ApiResponse<List<Account>> getAccounts() {
        ApiResponse<List<Account>> response = new ApiResponse<>();
        response.setMessage("List of accounts");
        response.setResult(accountService.getAllAccounts());
        return response;
    }

    @GetMapping("/find/{key}")
    @MessageMapping("/findAcc/{key}")
    @SendTo("/topic/accounts")
    ApiResponse<List<Account>> findAccountsByKeyWord(@DestinationVariable String key) {
        ApiResponse<List<Account>> response = new ApiResponse<>();
        response.setMessage("List of accounts");
        response.setResult(accountService.findAccountsByKeyword(key));
        return response;
    }


    @GetMapping("/myInfo")
    ApiResponse<AccountResponse> getInfo() {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setMessage("Get account info");
        response.setResult(accountService.getMyInfo());
        return response;
    }

    @GetMapping("{id}")
    ApiResponse<AccountResponse> getAccount(@PathVariable String id) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setMessage("Account with id " + id + " found");
        response.setResult(accountService.getAccountById(id));
        return response;
    }

    @PutMapping("/edit")
    ApiResponse<AccountResponse> edit (@RequestBody @Valid AccountUpdateRequest request) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setMessage("Account updated");
        response.setResult(accountService.edit(request));
        return response;
    }

    @PutMapping("/update/{id}")
    @MessageMapping("/updateAcc/{id}")
    @SendTo("/topic/accountUpdate")
    ApiResponse<AccountResponse> updateAccount(@DestinationVariable String id,@RequestBody @Valid AccountUpdateRequest request) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setMessage("Account updated");
        response.setResult(accountService.updateAccount(id, request));
        return response;
    }

    @PutMapping("/up-password")
    @MessageMapping("/updatePass")
    @SendTo("/topic/updatePassword")
    ApiResponse<AccountResponse> updatePassword(@RequestBody @Valid UpdatePassword request) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setMessage("Update password: ");
        response.setResult(accountService.updatePassword(request));
        return response;
    }

    @DeleteMapping("{id}")
    ApiResponse<String> deleteAccount(@PathVariable String id) {
        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage(accountService.deleteAccount(id));
        return response;
    }

    @PutMapping("{id}/ban")
    @MessageMapping("/banAccount/{id}/ban")
    @SendTo("/topic/banAcc")
    ApiResponse<String> banAccount(@DestinationVariable String id, @RequestParam BanType banType) {
        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Ban account: " + id);
        response.setResult(accountService.banAccount(id, banType));
        return response;
    }

    @PutMapping("{id}/unban")
    @MessageMapping("/unBanAccount/{id}")
    @SendTo("/topic/unBan")
    ApiResponse<String> unbanAccount(@DestinationVariable String id) {
        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Unban account: " + id);
        response.setResult(accountService.unbanAccount(id));
        return response;
    }

    @PostMapping("/forgetPassword")
    ApiResponse<String> resetPassword(@RequestBody @Valid ForgotPasswordRequest request){
        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Forget password");
        response.setResult(accountService.forgetPassword(request));
        return response;
    }

    @GetMapping("/number-of-accounts")
    @MessageMapping("/numberOfAccounts")
    @SendTo("/topic/numberOfAcc")
    ApiResponse<Long> getAccountsNumber() {
        return ApiResponse.<Long>builder()
                .message("Number of accounts")
                .code(1000)
                .result(accountService.numberOfAccounts())
                .build();
    }

    @GetMapping("/registrations/daily-in-current-week")
    ApiResponse<List<Long>> getRegistrationsByDayOfWeek() {
        return ApiResponse.<List<Long>>builder()
                .message("Registrations of week:")
                .code(1000)
                .result(accountService.getRegistrationsByDayOfWeek())
                .build();
    }

    @GetMapping("/registrations/weekly")
    ApiResponse<List<WeeklyRegistrationCountResponse>> getWeeklyRegistrations() {
        return ApiResponse.<List<WeeklyRegistrationCountResponse>>builder()
                .code(1000)
                .message("Weekly registrations in current month")
                .result(accountService.getWeeklyRegistrationsInCurrentMonth())
                .build();
    }

    @GetMapping("/registrations/monthly")
    public ApiResponse<List<MonthlyRegistrationCountResponse>> getMonthlyRegistrations() {
        List<MonthlyRegistrationCountResponse> monthlyRegistrations = accountService.getMonthlyRegistrationsInCurrentYear();
        return ApiResponse.<List<MonthlyRegistrationCountResponse>>builder()
                .code(1000)
                .message("Monthly registration count for the current year:")
                .result(monthlyRegistrations)
                .build();
    }
}
