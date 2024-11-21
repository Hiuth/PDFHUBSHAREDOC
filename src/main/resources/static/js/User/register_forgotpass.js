function sendOTP(e, type) {
    e.preventDefault();

    // Lấy email từ input field
    const email = document.getElementById("mail").value;

    // Kiểm tra email đầu vào
    if (!email) {
        document.querySelector('.error').textContent = "Vui lòng nhập email hợp lệ";
        document.querySelector('#OTP-title').innerText = '';
        document.querySelector('#OTP-title').innerText = 'Nhập mã OTP vừa được gửi về mail của bạn:'
        return false; // Dừng form submission
    }

    resetButtonText();
    openOTPPopup();
    // Hiển thị spinner
    document.querySelector('#OTP-title').innerHTML = '';
    document.querySelector('#OTP-title').innerHTML = '<div class="spinner"></div> Đang gửi mail cho bạn...';

    // Payload yêu cầu
    const requestPayload = {
        email: email,
        emailType: type,
        subject: "Your OTP Code",
        body: "Here is your OTP code for registration.",
        createBy: "",
        docName: ""
    };

    // Gửi API
    fetch("http://localhost:8088/email/send/otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
    })
        .then(response => response.json())
        .then(data => {
            // Xử lý kết quả
            if (data.code && data.code !== 1000) {
                document.querySelector('.error').textContent = data.message || "Không thể gửi OTP";
            } else {
                document.querySelector('.error').textContent = ""; // Xóa lỗi nếu gửi thành công
            }
        })
        .catch(error => {
            document.querySelector('.error').textContent = "Có lỗi xảy ra. Vui lòng thử lại.";
            console.error("Send OTP error:", error);
        })
        .finally(() => {
            document.querySelector('#OTP-title').innerHTML = '';
            document.querySelector('#OTP-title').innerHTML = '<img style="height: 35px; margin: -5px" src="../../static/images/icons/icons8-yes-48.png"><br>Mail đã được gửi thành công <br> Nhập mã OTP vừa được gửi về mail của bạn:'
            document.querySelector('#OTP-title').classList.add('animate-fadeInUp');

            setTimeout(() => {
                document.querySelector('#OTP-title').classList.remove('animate-fadeInUp');
            }, 500);
        });

    return false; // Dừng form submission
}


function openOTPPopup() {
    document.getElementById('otp-popup').style.display = '';
    document.getElementById('overlay').style.display = '';
}

function validateOTP(event, type) {
    event.preventDefault();

    // Lấy giá trị từ input
    const otp = document.getElementById("OTP").value.trim();
    const email = document.getElementById("mail").value.trim();
    const form = document.getElementById('otp-form');

    // Kiểm tra input
    if (!otp || otp.length !== 6) {
        document.querySelector(".error").textContent = "OTP phải có đúng 6 ký tự.";
        return false;
    }

    changeButtonText();

    // Tạo dữ liệu request
    const otpRequest = {
        otp: otp,
        email: email
    };

    // Gửi yêu cầu đến API
    fetch("http://localhost:8088/email/validOTP", { // Sửa lại URL khớp với Controller
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(otpRequest)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Chờ response JSON
        })
        .then((data) => {
            if (data.code === 1000 && data.result) {
                afterCheckOTP(type);
            } else {
                form.querySelector(".error").textContent = "OTP không đúng.";
                resetButtonText();
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            form.querySelector(".error").textContent = "Có lỗi xảy ra, vui lòng thử lại.";
        });

    return false;
}

function closeOTPPopup() {
    document.getElementById('otp-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function changeButtonText() {
    const button = document.getElementById('OTP-submit');
    button.textContent = "Đang xác nhận..."; // Đổi text
    button.classList.add('loading'); // Thêm class loading
    button.disabled = true; // Vô hiệu hóa nút
}

function resetButtonText() {
    const button = document.getElementById('OTP-submit');
    button.textContent = 'Xác nhận'; // Đổi text
    button.classList.remove('loading'); // Thêm class loading
    button.disabled = false; // Vô hiệu hóa nút
}

function afterCheckOTP(type) {
    resetButtonText()

    document.querySelector('#OTP-title').innerHTML = '';
    document.querySelector('#OTP-title').innerHTML = '<div class="spinner"></div><br>Xác nhận OTP thành công<br> Đang chuyển hướng...'
    document.querySelector('#OTP-title').classList.add('animate-fadeInUp');

    setTimeout(() => {
        document.querySelector('#OTP-title').classList.remove('animate-fadeInUp');
    }, 500);

    setTimeout(closeOTPPopup, 5000);

    document.querySelector('#get-otp').style.display = 'none';
    if(type == "REGISTER"){
        document.querySelector('#register').style.display = '';
        document.querySelector('#register').classList.add('animate-fadeInUp');
        setTimeout(() => {
            document.querySelector('#register').classList.remove('animate-fadeInUp');
        }, 500);
    } else if (type == "FORGOT_PASSWORD") {
        document.querySelector('#resetpass').style.display = '';
        document.querySelector('#resetpass').classList.add('animate-fadeInUp');
        setTimeout(() => {
            document.querySelector('#resetpass').classList.remove('animate-fadeInUp');
        }, 500);
    }

    setSession("nextform", "form2", 10);
}

// Hàm setSession với key và giá trị hết hạn trong 10 phút
function setSession(key, value, ttlInMinutes) {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttlInMinutes * 60 * 1000 // 10 phút = 600000ms
    };
    sessionStorage.setItem(key, JSON.stringify(item));
}

// Hàm getSession để kiểm tra giá trị và thời gian hết hạn
function getSession(key) {
    const itemStr = sessionStorage.getItem(key);

    if (!itemStr) {
        return null; // Không tồn tại
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // Nếu đã hết hạn, xóa key và trả về null
    if (now.getTime() > item.expiry) {
        sessionStorage.removeItem(key);
        return null;
    }
    return item.value;
}

// Hàm kiểm tra và hiển thị form tương ứng khi tải trang
function checkForm() {
    const nextForm = getSession("nextform");

    if (nextForm === "form2") {
        document.getElementById("get-otp").style.display = "none"; // Ẩn form 1
        document.getElementById("register").style.display = ''; // Hiển thị form 2
    } else {
        document.getElementById("get-otp").style.display = ''; // Hiển thị form 1
        document.getElementById("register").style.display = "none"; // Ẩn form 2
    }
}

window.onload = checkForm;
