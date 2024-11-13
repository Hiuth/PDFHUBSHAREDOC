package com.example.webchiasetailieu.exception;

import com.example.webchiasetailieu.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException e) {
        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
        //return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException e) {
        ApiResponse apiResponse = new ApiResponse();
        ErrorCode code = e.getCode();

        apiResponse.setCode(code.getCode());
        apiResponse.setMessage(code.getMessage());

        return ResponseEntity.status(code.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException e) {
        ErrorCode code = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(code.getStatusCode()).body(
                ApiResponse.builder()
                        .code(code.getCode())
                        .message(code.getMessage())
                        .build()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String enumKey = e.getFieldError().getDefaultMessage();
        ErrorCode code = ErrorCode.INVALID_KEY;
        ApiResponse apiResponse = new ApiResponse();

        try {
            code = ErrorCode.valueOf(enumKey);
        }catch (IllegalArgumentException iae) {
        }
        apiResponse.setCode(code.getCode());
        apiResponse.setMessage(code.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
        //return ResponseEntity.badRequest().body(e.getFieldError().getDefaultMessage());
    }
}
