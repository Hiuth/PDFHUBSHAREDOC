package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.PermissionRequest;
import com.example.webchiasetailieu.dto.response.PermissionResponse;
import com.example.webchiasetailieu.entity.Permission;
import com.example.webchiasetailieu.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {

    PermissionRepository repository;

    public PermissionResponse create(PermissionRequest request) {
        return convertToResponse(repository.save(Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build()));
    }

    public List<PermissionResponse> getAll(){
        var permissions = repository.findAll();
        return convertToResponse(permissions);
    }

    public String delete(String permissionName) {
        repository.deleteById(permissionName);
        return "Successfully deleted permission: " + permissionName;
    }

    PermissionResponse convertToResponse(Permission permission) {
        return PermissionResponse.builder()
                .name(permission.getName())
                .description(permission.getDescription())
                .build();
    }

    List<PermissionResponse> convertToResponse(List<Permission> permissions) {
        return permissions.stream()
                .map(this::convertToResponse) // sử dụng convertToResponse cho từng Permission
                .collect(Collectors.toList());
    }
}
