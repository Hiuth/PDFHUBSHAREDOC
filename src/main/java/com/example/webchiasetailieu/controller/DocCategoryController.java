package com.example.webchiasetailieu.controller;

import com.example.webchiasetailieu.dto.request.DocCategoryCreationRequest;
import com.example.webchiasetailieu.dto.response.ApiResponse;
import com.example.webchiasetailieu.dto.response.DocCategoryResponse;
import com.example.webchiasetailieu.entity.DocCategory;
import com.example.webchiasetailieu.service.DocCategoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/docCategory")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocCategoryController {
    DocCategoryService service;

    @PostMapping("/main")
    ApiResponse<DocCategoryResponse> createMainCategory(@RequestBody @Valid DocCategoryCreationRequest request){
        ApiResponse<DocCategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Creat main category: " + request.getMain());
        apiResponse.setResult(service.createMainCategory(request.getMain()));
        return apiResponse;
    }

    @PostMapping("/sub")
    ApiResponse<DocCategoryResponse> createSubCategory(@RequestBody @Valid DocCategoryCreationRequest request){
        ApiResponse<DocCategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Creat main category: " + request.getMain());
        apiResponse.setResult(service.createSubCategory(request));
        return apiResponse;
    }

    @PostMapping
    ApiResponse<DocCategoryResponse> createCategory(@RequestBody @Valid DocCategoryCreationRequest request){
        return ApiResponse.<DocCategoryResponse>builder()
                .message("Creat category: " + request.getMain() + " : " + request.getSub())
                .result(service.create(request))
                .build();
    }

    @GetMapping("/get-all")
    @MessageMapping("allCategories")
    @SendTo("/topic/getAllCategory")
    public ApiResponse<List<DocCategory>> getAllCategory(){
        ApiResponse<List<DocCategory>> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Get all category");
        apiResponse.setResult(service.getAll());
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<DocCategoryResponse> getCategoryById(@PathVariable String id){
        ApiResponse<DocCategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Get category by id: ");
        apiResponse.setResult(service.getById(id));
        return apiResponse;
    }

    @PutMapping("/{id}")
    public ApiResponse<DocCategoryResponse> updateCategory(@PathVariable String id,
                                            @RequestBody @Valid DocCategoryCreationRequest request){
        ApiResponse<DocCategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Update category: " + request.getMain() + " or " + request.getSub());
        apiResponse.setResult(service.update(id, request));
        return apiResponse;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteCategory(@PathVariable String id){
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Delete category: ");
        apiResponse.setResult(service.delete(id));
        return apiResponse;
    }

    @DeleteMapping("/main")
    public ApiResponse<String> deleteMainCategory(@RequestBody @Valid DocCategoryCreationRequest request){
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Delete main category: " + request.getMain());
        apiResponse.setResult(service.deleteMain(request.getMain()));
        return apiResponse;
    }

    @DeleteMapping("/sub")
    public ApiResponse<String> deleteSubCategory(@RequestBody @Valid DocCategoryCreationRequest request){
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Delete sub category: " + request.getMain());
        apiResponse.setResult(service.deleteSub(request.getMain()));
        return apiResponse;
    }
}
