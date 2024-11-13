package com.example.webchiasetailieu.service;

import com.example.webchiasetailieu.dto.request.DocCategoryCreationRequest;
import com.example.webchiasetailieu.dto.response.DocCategoryResponse;
import com.example.webchiasetailieu.entity.DocCategory;
import com.example.webchiasetailieu.exception.AppException;
import com.example.webchiasetailieu.exception.ErrorCode;
import com.example.webchiasetailieu.repository.DocCategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocCategoryService {
    DocCategoryRepository repository;

    @PreAuthorize("hasRole('ADMIN')")
    public DocCategoryResponse create(DocCategoryCreationRequest request) {
        DocCategory category = DocCategory.builder()
                .mainCategory(request.getMain())
                .subCategory(request.getSub())
                .build();
        return convertToResponse(repository.save(category));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public DocCategoryResponse createMainCategory(String mainCategory) {
        if(repository.existsByMainCategory(mainCategory))
            throw new AppException(ErrorCode.CATEGORY_EXISTED);

        DocCategory docCategory = DocCategory.builder()
                .mainCategory(mainCategory)
                .build();
        return convertToResponse(repository.save(docCategory));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public DocCategoryResponse createSubCategory(DocCategoryCreationRequest request) {
        if(repository.existsBySubCategory(request.getSub()))
            throw new AppException(ErrorCode.CATEGORY_EXISTED);

        if(request.getSub().isBlank())
            throw new AppException(ErrorCode.SUBCATEGORY_BLANK);

        DocCategory docCategory = DocCategory.builder()
                .subCategory(request.getSub())
                .mainCategory(request.getMain())
                .build();
        return convertToResponse(repository.save(docCategory));
    }

    //public
    public List<DocCategory> getAll() {
        if(repository.findAll().isEmpty())
            throw new AppException(ErrorCode.LIST_EMPTY);
        return repository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public DocCategoryResponse getById(String id) {
        return convertToResponse(repository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.CATEGORY_NOT_EXIST)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public DocCategoryResponse update(String id, DocCategoryCreationRequest request) {
        DocCategory docCategory = repository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.CATEGORY_NOT_EXIST));

        if(!request.getSub().isBlank())
            docCategory.setSubCategory(request.getSub());
        if(!request.getMain().isBlank())
            docCategory.setMainCategory(request.getMain());

        return convertToResponse(repository.save(docCategory));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String delete(String id) {
        DocCategory docCategory = repository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_EXIST));
        repository.deleteById(id);
        if(repository.existsById(id))
            return "Failed to delete";
        return "Deleted Successfully";
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String deleteMain(String main){
        if(!repository.existsByMainCategory(main))
            throw new AppException(ErrorCode.CATEGORY_NOT_EXIST);
        List<DocCategory> docCategories = repository.findByMainCategory(main);
        repository.deleteAll(docCategories);
        if(repository.existsByMainCategory(main))
            return "Failed to delete";
        return "Deleted Successfully";
    }

    @PreAuthorize("hasRole('ADMIN')")
    public String deleteSub(String sub){
        if(!repository.existsBySubCategory(sub))
            throw new AppException(ErrorCode.CATEGORY_NOT_EXIST);
        List<DocCategory> docCategories = repository.findBySubCategory(sub);
        repository.deleteAll(docCategories);
        if (repository.existsBySubCategory(sub))
            return "Failed to delete";
        return "Deleted Successfully";
    }

    private DocCategoryResponse convertToResponse(DocCategory category) {
        return DocCategoryResponse.builder()
                .main(category.getMainCategory())
                .sub(category.getSubCategory())
                .build();
    }
}
