package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.PerInfoCreationRequest;
import com.example.webchiasetailieu.dto.request.PerInfoUpdateRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.PerInfoResponse;
import com.example.webchiasetailieu.entity.PersonalInformation;
import com.example.webchiasetailieu.service.PersonalInformationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@RestController
@RequestMapping("/perInfo")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PersonalInformationController {

    @Autowired
    private PersonalInformationService perInfoService;

    @GetMapping
    ApiResponse<List<PersonalInformation>> getAllPersonalInformation() {
        ApiResponse<List<PersonalInformation>> response = new ApiResponse<>();
        response.setMessage("List of personal information");
        response.setResult(perInfoService.getAllPersonalInformation());
        return response;
    }

    @GetMapping("/get-info")
    ApiResponse<PerInfoResponse> getMyPerInfo() {
        ApiResponse<PerInfoResponse> response = new ApiResponse<>();
        response.setMessage("Get personal information ");
        response.setResult(perInfoService.getMyPersonalInformation());
        return response;
    }

    @GetMapping("{id}")
    ApiResponse<PerInfoResponse> getPerInfoById(@PathVariable String id) {
        ApiResponse<PerInfoResponse> response = new ApiResponse<>();
        response.setMessage("Get personal information ");
        response.setResult(perInfoService.getPersonalInformationById(id));
        return response;
    }

    @GetMapping("/account/{id}")
    ApiResponse<PerInfoResponse> getPersonalInformationByAccountId(@PathVariable String id) {
        ApiResponse<PerInfoResponse> response = new ApiResponse<>();
        response.setMessage("Get personal information of account ");
        response.setResult(perInfoService.getPersonalInformationByAccountId(id));
        return response;
    }

    @PostMapping
    ApiResponse<PerInfoResponse> createPersonalInformation(@RequestBody @Valid PerInfoCreationRequest request) {
        ApiResponse<PerInfoResponse> response = new ApiResponse<PerInfoResponse>();
        response.setResult(perInfoService.createPersonalInformation(request));
        return response;
    }

    @PutMapping("{id}")
    ApiResponse<PerInfoResponse> updatePersonalInformation(@PathVariable String id, @RequestBody @Valid PerInfoUpdateRequest request) {
        ApiResponse<PerInfoResponse> response = new ApiResponse<PerInfoResponse>();
        response.setMessage("Update personal information");
        response.setResult(perInfoService.updatePersonalInformation(id, request));
        return response;
    }

    @DeleteMapping("{id}")
    ApiResponse<String> deletePersonalInformation(@PathVariable String id) {
        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Delete personal information");
        response.setResult(perInfoService.deletePersonalInformation(id));
        return response;
    }

    @PostMapping("/upAvatar/{accountId}")
    ApiResponse<PerInfoResponse> AddMyAvatar(@RequestParam("file") MultipartFile file, @PathVariable String accountId)  throws GeneralSecurityException, IOException {
        return ApiResponse.<PerInfoResponse>builder()
                .result(perInfoService.saveMyAvatar(file))
                .build();
    }
}
