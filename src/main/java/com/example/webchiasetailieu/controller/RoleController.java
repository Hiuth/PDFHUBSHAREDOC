package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.RoleRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.RoleResponse;
import com.example.webchiasetailieu.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {
    RoleService service;

    @PostMapping
    ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(service.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(service.getAll())
                .build();
    }

    @DeleteMapping("{role}")
    ApiResponse<String> delete(@PathVariable String role) {
        return ApiResponse.<String>builder()
                .result(service.delete(role))
                .build();
    }
}
