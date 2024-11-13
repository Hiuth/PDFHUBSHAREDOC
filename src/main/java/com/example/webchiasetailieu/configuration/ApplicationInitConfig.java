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
import java.util.HashSet;
import java.util.List;

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
    @Value("${jwt.admin-password}")
    static String adminPassword;

    @Bean
    @Transactional
    ApplicationRunner applicationRunner(AccountRepository accountRepository) {
        return args -> {
            String currentDirectory = System.getProperty("user.dir");
            Path permissionsFilePath = Paths.get(currentDirectory, "permission.json");
            Path rolesFilePath = Paths.get(currentDirectory, "roles.json");
            Path driveFilePath = Paths.get(currentDirectory, "pdfhub-438314-2ecea7d9fee0.json");

            Path encryptedDriveFilePath = Paths.get(currentDirectory, "drive.json.enc");
            if (!Files.exists(encryptedDriveFilePath)) {
                JsonEncryptorUtil jsonEncryptorUtil = new JsonEncryptorUtil();
                jsonEncryptorUtil.encryptJsonFile(driveFilePath.toString(), encryptedDriveFilePath.toString());
            }


            List<PermissionRequest> permissions = permissionLoader.loadPermissionsFromFile(permissionsFilePath.toString());
            for (PermissionRequest request : permissions) {
                if (!permissionRepository.existsById(request.getName())) {
                    permissionRepository.save(Permission.builder()
                            .name(request.getName())
                            .description(request.getDescription())
                            .build());
                }
            }

            List<RoleRequest> roles = roleLoader.loadRolesFromFile(rolesFilePath.toString());
            for (RoleRequest request : roles) {
                if (!roleRepository.existsById(request.getName())) {
                    var permission = permissionRepository.findAllById(request.getPermissions());
                    Role role = Role.builder()
                            .name(request.getName())
                            .description(request.getDescription())
                            .permissions(new HashSet<>(permission))
                            .build();
                    roleRepository.save(role);
                }
            }

            if(accountRepository.findByEmail("admin").isEmpty()) {
                Account account = Account.builder()
                        .email("admin")
                        .password(passwordEncoder.encode(adminPassword))
                        .name("thu")
                        .roles(new HashSet<>(roleRepository.findAllById(List.of(UserRole.ADMIN.name()))))
                        .build();
                accountRepository.save(account);
                log.warn("admin account created with default password : admin, please change it!");
            }
        };
    }
}
