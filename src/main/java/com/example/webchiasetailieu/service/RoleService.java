package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.RoleRequest;
import com.example.webchiasetailieu.dto.response.PermissionResponse;
import com.example.webchiasetailieu.dto.response.RoleResponse;
import com.example.webchiasetailieu.entity.Permission;
import com.example.webchiasetailieu.entity.Role;
import com.example.webchiasetailieu.repository.PermissionRepository;
import com.example.webchiasetailieu.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepository repository;
    PermissionRepository permissionRepository;

    public RoleResponse create(RoleRequest request) {
        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        var permissions = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));
        role = repository.save(role);
        return convertToResponse(role);
    }

    public List<RoleResponse> getAll() {
        var roles = repository.findAll();
        return convertToResponseList(roles);
    }

    public String delete(String role) {
        repository.deleteById(role);
        return "Successfully deleted roles " + role;
    }

    public List<RoleResponse> convertToResponseList(List<Role> roles) {
        return roles.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public RoleResponse convertToResponse(Role role) {
        Set<PermissionResponse> permissionResponses = role.getPermissions().stream()
                .map(this::convertToPermissionResponse)
                .collect(Collectors.toSet());
        return RoleResponse.builder()
                .name(role.getName())
                .description(role.getDescription())
                .permissions(permissionResponses)
                .build();
    }

    public PermissionResponse convertToPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .name(permission.getName())
                .description(permission.getDescription())
                .build();
    }
}
