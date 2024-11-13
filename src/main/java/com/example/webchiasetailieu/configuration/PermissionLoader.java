package com.example.webchiasetailieu.configuration;

import com.example.webchiasetailieu.dto.request.PermissionRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Component
public class PermissionLoader {
    private final ObjectMapper objectMapper;

    public PermissionLoader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<PermissionRequest> loadPermissionsFromFile(String filePath) throws IOException {
        return objectMapper.readValue(new File(filePath), new TypeReference<List<PermissionRequest>>() {});
    }
}
