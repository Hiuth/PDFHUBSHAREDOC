package com.example.webchiasetailieu.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Getter
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum NotificationType {
    REGISTER(
            "Đăng ký thành công!",
            "Đăng ký thành công! Tài khoản của bạn đã được cộng 20 điểm."
    ),
    UPLOAD(
            "Tải lên thành công!",
            "Bạn đã tải lên tài liệu thành công và nhận được điểm thưởng."
    ),
    DOWNLOAD(
            "Lượt tải xuống",
            "Tài liệu của bạn đã được tải xuống lần trong ngày hôm nay. " +
                    "Cảm ơn bạn đã đóng góp cho cộng đồng!"
    ),
    COMMENT(
            "Bình luận",
            "Bài viết của bạn đã nhận được một bình luận mới. " +
                    "Hãy xem và phản hồi để giữ cho cuộc thảo luận sôi nổi!"
    ),
    POST_VIOLATION(
            "Vi phạm bài viết",
            "Bài viết %s của bạn đã vi phạm quy định của trang web. Vui lòng gỡ bỏ bài hoặc " +
                    "chỉnh sửa để tuân thủ chính sách của chúng tôi."
    ),
    ACCOUNT_LOCKED(
            "Tài khoản bị khóa",
            "Tài khoản của bạn đã bị khóa do vi phạm điều khoản sử dụng. " +
                    "Vui lòng liên hệ với quản trị viên để được hỗ trợ thêm."
    ),
    ADMIN_FEEDBACK(
            "Phản hồi từ quản trị viên",
            "Quản trị viên đã phản hồi yêu cầu của bạn: " +
                    "Hãy kiểm tra và cập nhật thông tin kịp thời."
    ),
    COMMENT_VIOLATION(
            "Vi phạm về bình luận",
            "Bình luận của bạn trên bài viết %s đã vi phạm quy định. " +
                    "Hãy sửa đổi hoặc bình luận phù hợp hơn để tránh bị xử phạt."
    ),
    RECEIVE_POINTS(
            "Nhận xu khi đăng bài",
            "Chúc mừng! Bạn đã nhận được xu cho bài viết mới của mình. " +
                    "Tiếp tục chia sẻ nhiều tài liệu hơn để nhận thêm!"
    ),
    COMMENT_ACCOUNT_LOCKED(
            "Tài khoản bị khóa do vi phạm bình luận",
            "Tài khoản của bạn đã bị khóa do nhiều lần vi phạm quy định về bình luận. " +
                    "Vui lòng liên hệ quản trị viên nếu cần hỗ trợ."
    ),
    COMMENT_WARNING(
            "Cảnh cáo về bình luận phản cảm",
            "Bạn đã nhận được cảnh cáo vì bình luận không phù hợp. " +
                    "Vui lòng tuân thủ quy định khi tham gia thảo luận để tránh bị xử phạt."
    ),
    FEEDBACK(
            "Báo cáo từ người dùng",
            "Bạn đã nhận được báo cáo từ người dùng. " +
                    "Hãy xử nó lí sớm nhất có thể."
    );
    String title;
    String description;
}
