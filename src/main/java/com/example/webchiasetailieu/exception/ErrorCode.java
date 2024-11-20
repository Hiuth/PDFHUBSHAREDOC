package com.example.webchiasetailieu.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    EMAIL_EXISTED(1001, "Email already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1002, "User not exists", HttpStatus.NOT_FOUND),
    OTP_INCORRECT(1003, "OTP incorrect", HttpStatus.BAD_REQUEST),
    NAME_INVALID(1004, "Name must be at least 5 characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1005, "Password must be at least 6 characters", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1006, "Invalid email", HttpStatus.BAD_REQUEST),
    BIRTHDAY_INVALID(1007, "Birthday must be a day in the past", HttpStatus.BAD_REQUEST),
    GENDER_INVALID(1008, "Gender must be either 'male' or 'female'", HttpStatus.BAD_REQUEST),
    ACCOUNT_EMPTY(1009, "List of accounts is empty", HttpStatus.NO_CONTENT),
    NOT_NULL(1010, "Something is blank", HttpStatus.BAD_REQUEST),
    PERSONAL_INFORMATION_EMPTY(1011, "List of accounts is empty", HttpStatus.NO_CONTENT),
    PERINFO_EMPTY(1012, "User has not added personal information", HttpStatus.NOT_FOUND),
    ACCOUNT_BANNED(1013, "Account has been banned", HttpStatus.FORBIDDEN),
    PASSWORD_NOT_CORRECT(1014, "Password not correct", HttpStatus.UNAUTHORIZED),
    SEND_EMAIL_FAILED(1015, "Send email failed", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_INVALID(1016, "Folder and name must be at least 3 characters", HttpStatus.BAD_REQUEST),
    CATEGORY_EXISTED(1017, "This main or sub-category already exists", HttpStatus.CONFLICT),
    SUBCATEGORY_BLANK(1018, "Sub-category must not be blank", HttpStatus.BAD_REQUEST),
    LIST_EMPTY(1019, "List is empty", HttpStatus.NO_CONTENT),
    CATEGORY_NOT_EXIST(1020, "This main or sub-category does not exist", HttpStatus.NOT_FOUND),
    NOTIFICATION_LENGTH(1021, "Title and content must be at least 5 characters", HttpStatus.BAD_REQUEST),
    NOTIFICATION_EXISTED(1022, "Notification already exists", HttpStatus.CONFLICT),
    NOTIFICATION_NOT_EXISTED(1023, "Notification not exists", HttpStatus.NOT_FOUND),
    FEEDBACK_EXISTED(1024, "You have already sent feedback. If you want to change anything, please update the old feedback.", HttpStatus.CONFLICT),
    FILE_EMPTY(1025, "File is empty", HttpStatus.BAD_REQUEST),
    FILE_NAME_INVALID(1026, "File name must be at least 3 characters", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1027, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    DOC_NOT_EXIST(1028, "Document does not exist", HttpStatus.NOT_FOUND),
    COMMENT_NOT_EXIST(1029, "Comment does not exist", HttpStatus.NOT_FOUND),
    NOT_ENOUGH_POINT_TO_DOWNLOAD(1030, "Not enough points to download", HttpStatus.FORBIDDEN),
    INCORRECT_OTP(1031, "Incorrect OTP", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1032, "You do not have permission", HttpStatus.FORBIDDEN),
    USERNAME_EXISTED(1033, "Username already exists", HttpStatus.BAD_REQUEST),
    FAILED_TO_SENT_EMAIL(1034, "Failed to sent email", HttpStatus.INTERNAL_SERVER_ERROR),
    ERROR_HASHING(1035,"Error hashing input when hash a otp", HttpStatus.INTERNAL_SERVER_ERROR),
    OTP_EXPIRED(1036, "OTP expired", HttpStatus.UNAUTHORIZED),
    FEEDBACK_NOT_FOUND(1037, "Feedback does not exist", HttpStatus.NOT_FOUND),
    PER_INFO_EXISTED(1038, "Per-info already exists", HttpStatus.CONFLICT),
    DRIVE_UPLOAD_FAILED(1039, "Drive upload failed", HttpStatus.INTERNAL_SERVER_ERROR),
    FEEDBACK_TYPE_INCORRECT(1040,"Incorrect feedback type", HttpStatus.BAD_REQUEST),

    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception", HttpStatus.SERVICE_UNAVAILABLE),
    INVALID_KEY(8888, "Invalid key", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}

//Giải thích:
//BAD_REQUEST (400): Được sử dụng cho các lỗi do dữ liệu đầu vào không hợp lệ hoặc vi phạm yêu cầu của hệ thống (ví dụ: NAME_INVALID, PASSWORD_INVALID, EMAIL_INVALID).
//NOT_FOUND (404): Được sử dụng khi tài nguyên không tồn tại (ví dụ: USER_NOT_EXISTED, CATEGORY_NOT_EXIST).
//CONFLICT (409): Được sử dụng khi có xung đột trong thao tác dữ liệu (ví dụ: EMAIL_EXISTED, CATEGORY_EXISTED).
//FORBIDDEN (403): Được sử dụng khi người dùng không có quyền thực hiện một thao tác (ví dụ: ACCOUNT_BANNED, NOT_ENOUGH_POINT_TO_DOWNLOAD).
//UNAUTHORIZED (401): Được sử dụng khi yêu cầu không được xác thực đúng (ví dụ: UNAUTHENTICATED, PASSWORD_NOT_CORRECT).
//NO_CONTENT (204): Được sử dụng khi không có dữ liệu nào để trả về nhưng yêu cầu đã được xử lý thành công (ví dụ: ACCOUNT_EMPTY, LIST_EMPTY).
//INTERNAL_SERVER_ERROR (500): Được sử dụng cho các lỗi không xác định hoặc lỗi hệ thống bên trong (ví dụ: SEND_EMAIL_FAILED, UNCATEGORIZED_EXCEPTION).
