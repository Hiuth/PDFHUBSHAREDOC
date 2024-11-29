//format form và check lỗi form
function updateFileName2() {
    const fileInput = document.getElementById('changeAvatar');
    var fileNameDisplay = document.getElementById('fileName');

    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name; // Lấy tên tệp
        fileNameDisplay.textContent = fileName; // Cập nhật nội dung thẻ hiển thị
    } else {
        fileNameDisplay.textContent = 'Chưa chọn tệp'; // Thông báo nếu không có tệp nào được chọn
    }

    document.getElementById('changeAvatarSubmit').style.display = '';
}

function updateFileName() {
    const fileInput = document.getElementById('file');
    var fileNameDisplay = document.getElementById('fileName');
    const fileNameDiv = document.getElementById("fileName");
    const pdfViewDiv = document.getElementById("pdfview");

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        // Kiểm tra dung lượng tệp (5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            fileInput.value = ''; // Reset giá trị input
            fileNameDisplay.textContent = 'Tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.'; // Hiển thị thông báo
            pdfViewDiv.innerHTML = "<div class='center-text'>PDF BẠN TẢI LÊN SẼ ĐƯỢC HIỂN THỊ Ở ĐÂY</div>";
            return; // Dừng xử lý tiếp
        }

        const fileName = file.name; // Lấy tên tệp
        fileNameDisplay.textContent = fileName; // Cập nhật nội dung thẻ hiển thị

        // Kiểm tra loại tệp
        if (file.type === "application/pdf") {
            const fileURL = URL.createObjectURL(file);

            // Tạo iframe để hiển thị PDF
            pdfViewDiv.innerHTML = `<iframe src="${fileURL}" width="100%" height="100%"></iframe>`;
        } else if (file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            pdfViewDiv.innerHTML = "<div class='center-text'>Hiển thị tệp Word không được hỗ trợ trong trình duyệt.</div>";
        } else {
            fileNameDisplay.textContent = "Vui lòng chọn một tệp PDF hoặc Word.";
            pdfViewDiv.innerHTML = "<div class='center-text'>PDF BẠN TẢI LÊN SẼ ĐƯỢC HIỂN THỊ Ở ĐÂY</div>";
        }
    } else {
        fileNameDisplay.textContent = 'Chưa chọn tệp'; // Thông báo nếu không có tệp nào được chọn
        pdfViewDiv.innerHTML = ''; // Xóa nội dung nếu không có tệp
    }
}


// function ChangeInfo() {
//     // Ẩn nút 'Thay đổi' và hiển thị nút 'Lưu'
//     document.querySelector("a[onclick='ChangeInfo()']").style.display = 'none';
//     document.querySelector("a[onclick='ConfirmChangeInfo()']").style.display = '';
//
//     // Hiển thị thông báo thay đổi
//     document.querySelector(".ChangeTitle").style.display = '';
//
//     // Lấy tất cả các input có class 'read' trong form với id 'infoChange'
//     document.querySelectorAll("#infoChange .read").forEach(input => {
//         input.removeAttribute("readonly");
//         input.removeAttribute("disabled")
//         input.style.pointerEvents = "auto"; // Cho phép click vào
//         input.style.border = "1px solid #ccc"; // Đặt viền khi có thể chỉnh sửa
//     });
// }



function isValidDate(dateString) {
    // Kiểm tra xem định dạng có khớp với dd/mm/yyyy không
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    // Tách ngày, tháng và năm
    const [day, month, year] = dateString.split('/').map(Number);

    // Kiểm tra năm có hợp lệ
    if (year < 1900 || year > new Date().getFullYear()) {
        return false;
    }

    // Kiểm tra tháng và ngày có hợp lệ với từng tháng
    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day > 0 && day <= daysInMonth[month - 1];
}

function openOTPPopup() {
    document.getElementById('otp-popup').style.display = '';
    document.getElementById('overlay').style.display = '';
}

// Function to close popup
function closeOTPPopup() {
    document.getElementById('otp-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function closePassPopup() {
    document.getElementById('pass-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
function openChangePass() {
    document.getElementById('pass-popup').style.display = '';
    document.getElementById('overlay').style.display = '';
}

function ChangePass(event) {
    event.preventDefault(); // Ngăn chặn form load lại trang

    const otpInput = document.getElementById("OTP").value.trim();
    const correctOTP = "123456"; // Giả định mã OTP đúng (thay bằng mã OTP thực tế từ hệ thống nếu có)

    if (otpInput === correctOTP) {
        closeOTPPopup();

        // Bỏ readonly của input mật khẩu để cho phép người dùng chỉnh sửa
        const passInput = document.getElementById("pass");
        passInput.removeAttribute("readonly");
        passInput.focus();
        passInput.select();

        // Hiển thị nút "Lưu" và ẩn nút "Thay đổi" cho mật khẩu
        document.querySelector("#mailAndPass a[onclick='ConfirmChangePass()']").style.display = "";
        document.querySelector("#mailAndPass a[onclick='openOTPPopup()']").style.display = "none";

        // Thông báo thành công nếu cần
        passInput.parentElement.previousElementSibling.previousElementSibling.style.display = "";
    } else {
        // Hiển thị lỗi nếu OTP sai
        document.querySelector("#inputOTP .error").textContent = "Mã OTP không đúng. Vui lòng thử lại.";
    }
}

function ChangeAvatar() {
    const outsideDiv = document.getElementById('outside');
    const avatarContain = document.getElementById('avatarContain');
    const submitButton = document.getElementById('changeAvatarSubmit');

    // Đổi class form-group1 -> form-group2
    outsideDiv.classList.remove('form-group1');
    outsideDiv.classList.add('form-group2');

    // Hiển thị avatar contain
    avatarContain.style.display = 'block';

    // Hiển thị nút Lưu
    submitButton.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    initializeAvatarEvents();
});

function initializeAvatarEvents() {
    // Gắn sự kiện click
    document.querySelectorAll('#avatarContain .avatar-options img').forEach(img => {
        img.addEventListener('click', function () {
            // Xử lý chọn avatar
            document.querySelectorAll('#avatarContain .avatar-options img').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('selectedAvatar').value = this.dataset.avatar;
        });
    });
}