package com.example.webchiasetailieu.exception;

public class AppException extends RuntimeException {

    private ErrorCode code;

    public AppException(ErrorCode code) {
        super(code.getMessage());
        this.code = code;
    }

    public ErrorCode getCode() {
        return code;
    }

    public void setCode(ErrorCode code) {
        this.code = code;
    }
}
