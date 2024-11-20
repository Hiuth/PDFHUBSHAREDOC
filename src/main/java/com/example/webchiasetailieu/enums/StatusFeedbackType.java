package com.example.webchiasetailieu.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Getter
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum StatusFeedbackType {
    UNPROCESSED("Chưa xử lí"),
    PROCESSING("Đang xử lí"),
    PROCESSED("Đã xử lí"),
    ;

    String description;
}
