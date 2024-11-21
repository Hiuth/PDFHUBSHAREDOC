package com.example.webchiasetailieu.configuration;

import com.example.webchiasetailieu.dto.request.PermissionRequest;
import com.example.webchiasetailieu.dto.request.RoleRequest;
import com.example.webchiasetailieu.entity.Account;
import com.example.webchiasetailieu.entity.Permission;
import com.example.webchiasetailieu.entity.Role;
import com.example.webchiasetailieu.enums.UserRole;
import com.example.webchiasetailieu.repository.AccountRepository;
import com.example.webchiasetailieu.repository.PermissionRepository;
import com.example.webchiasetailieu.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    PermissionLoader permissionLoader;
    RoleLoader roleLoader;

    @NonFinal
    @Value("${admin-password}")
    protected String adminPassword;

    @NonFinal
    @Value("${json-encrypt.password}")
    private String password;

    @Bean
    @Transactional
    ApplicationRunner applicationRunner(AccountRepository accountRepository) {
        return args -> {

            JsonEncryptorUtil jsonEncryptorUtil = new JsonEncryptorUtil();
            jsonEncryptorUtil.setPassword(password);

            String currentDirectory = System.getProperty("user.dir");
            Path permissionsFilePath = Paths.get(currentDirectory, "permission.json");
            Path rolesFilePath = Paths.get(currentDirectory, "roles.json");
            Path driveFilePath = Paths.get(currentDirectory, "pdfhub-438314-2ecea7d9fee0.json");

            Path encryptedDriveFilePath = Paths.get(currentDirectory, "drive.json.enc");
            if (!Files.exists(encryptedDriveFilePath)) {
                jsonEncryptorUtil.encryptJsonFile(driveFilePath.toString(), encryptedDriveFilePath.toString());
            }

            List<PermissionRequest> permissions = permissionLoader.loadPermissionsFromFile(permissionsFilePath.toString());
            Map<String, Permission> existingPermissions = permissionRepository.findAll()
                    .stream()
                    .collect(Collectors.toMap(Permission::getName, Function.identity()));

            List<Permission> updatedPermissions = new ArrayList<>();
            for (PermissionRequest request : permissions) {
                Permission permission = existingPermissions.get(request.getName());
                if (permission == null) {
                    updatedPermissions.add(Permission.builder()
                            .name(request.getName())
                            .description(request.getDescription())
                            .build());
                } else if (!permission.getDescription().equals(request.getDescription())) {
                    permission.setDescription(request.getDescription());
                    updatedPermissions.add(permission);
                }
            }
            permissionRepository.saveAll(updatedPermissions);

            List<RoleRequest> roles = roleLoader.loadRolesFromFile(rolesFilePath.toString());

            for (RoleRequest request : roles) {
                Set<Permission> rolePermissions = new HashSet<>();
                for (String permissionName : request.getPermissions()) {
                    Permission permission = existingPermissions.get(permissionName);
                    if (permission == null) {
                        permission = permissionRepository.save(Permission.builder()
                                .name(permissionName)
                                .description(permissionName + " description")
                                .build());
                        existingPermissions.put(permissionName, permission);
                    }
                    rolePermissions.add(permission);
                }

                Optional<Role> existingRole = roleRepository.findById(request.getName());
                if (existingRole.isPresent()) {
                    Role role = existingRole.get();
                    if (!role.getPermissions().equals(rolePermissions)) {
                        role.setPermissions(rolePermissions);
                        roleRepository.save(role);
                    }
                } else {
                    Role role = Role.builder()
                            .name(request.getName())
                            .description(request.getDescription())
                            .permissions(rolePermissions)
                            .build();
                    roleRepository.save(role);
                }
            }


            if(accountRepository.findByEmail("pdfhubsharedoc@gmail.com").isEmpty()) {
                Account account = Account.builder()
                        .email("pdfhubsharedoc@gmail.com")
                        .password(passwordEncoder.encode(adminPassword))
                        .name("Admin")
                        .roles(new HashSet<>(roleRepository.findAllById(List.of(UserRole.ADMIN.name()))))
                        .build();
                accountRepository.save(account);
                log.warn("admin account created with default password : admin, please change it!");
            }
        };
    }
}
