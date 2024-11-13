package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.PermissionRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.PermissionResponse;
import com.example.webchiasetailieu.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permission")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionController {
    PermissionService service;

    @PostMapping
    ApiResponse<PermissionResponse> create(@RequestBody PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(service.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(service.getAll())
                .build();
    }

    @DeleteMapping("{permissionName}")
    ApiResponse<String> delete(@PathVariable String permissionName) {
        return ApiResponse.<String>builder()
                .result(service.delete(permissionName))
                .build();
    }
}
