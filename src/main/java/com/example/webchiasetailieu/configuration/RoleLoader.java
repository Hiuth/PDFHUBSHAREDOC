package com.example.webchiasetailieu.configuration;

import com.example.webchiasetailieu.dto.request.RoleRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Component
public class RoleLoader {
    private final ObjectMapper objectMapper;

    public RoleLoader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<RoleRequest> loadRolesFromFile(String filePath) throws IOException {
        return objectMapper.readValue(new File(filePath), new TypeReference<List<RoleRequest>>() {});
    }
}

