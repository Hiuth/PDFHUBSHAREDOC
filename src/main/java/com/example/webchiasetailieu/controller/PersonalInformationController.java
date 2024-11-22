package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.CreateMyPerInfoRequest;
import com.example.webchiasetailieu.dto.request.CreationInfoAfterRegisterRequest;
import com.example.webchiasetailieu.dto.request.UpdatePerInfoRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.PerInfoResponse;
import com.example.webchiasetailieu.service.PersonalInformationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.GeneralSecurityException;

@RestController
@RequestMapping("/perInfo")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PersonalInformationController {

    PersonalInformationService service;

    @PostMapping
    ApiResponse<PerInfoResponse> addMyPersonalInformation(@RequestBody @Valid CreateMyPerInfoRequest request) {
        return ApiResponse.<PerInfoResponse>builder()
                .code(1000)
                .message("Create my personal information")
                .result(service.create(request))
                .build();
    }

    @PutMapping
    @MessageMapping("/addInfo")
    @SendTo("/topic/addInformation")
    ApiResponse<PerInfoResponse> updateMyPersonalInformation(@RequestBody @Valid UpdatePerInfoRequest request) {
        return ApiResponse.<PerInfoResponse>builder()
                .code(1000)
                .message("Update my personal information")
                .result(service.update(request))
                .build();
    }

    @PutMapping("/updateAvatar/{FileName}")
    ApiResponse<PerInfoResponse> updateMyAvatar(@PathVariable String FileName) {
        return ApiResponse.<PerInfoResponse>builder()
                .code(1000)
                .message("Update my avatar")
                .result(service.updateMyAvatar(FileName))
                .build();
    }


    @GetMapping
    @MessageMapping("/getInfo")
    @SendTo("/topic/getInfo")
    ApiResponse<PerInfoResponse> viewMyPersonalInformation() {
        return ApiResponse.<PerInfoResponse>builder()
                .code(1000)
                .message("Update my personal information")
                .result(service.viewMyPerInfo())
                .build();
    }

    @PostMapping("/upMyAvatar")
    ApiResponse<PerInfoResponse> addMyAvatar(@RequestParam("file") MultipartFile file)  throws GeneralSecurityException, IOException {
        return ApiResponse.<PerInfoResponse>builder()
                .code(1000)
                .message("Create my avatar")
                .result(service.saveMyAvatar(file))
                .build();
    }

    @PostMapping("/register/add-info")
    ApiResponse<PerInfoResponse> addMyPersonalInformationAfterRegister(@RequestBody @Valid CreationInfoAfterRegisterRequest request) {
        return ApiResponse.<PerInfoResponse>builder()
                .code(1000)
                .message("Create my personal information")
                .result(service.createInfoAfterRegister(request))
                .build();
    }


}
