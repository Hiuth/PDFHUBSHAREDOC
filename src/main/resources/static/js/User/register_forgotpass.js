function sendOTP(e) {
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

    openOTPPopup();
    // Hiển thị spinner
    document.querySelector('#OTP-title').innerHTML = '';
    document.querySelector('#OTP-title').innerHTML = '<div class="spinner"></div> Đang gửi mail cho bạn...';

    // Payload yêu cầu
    const requestPayload = {
        email: email,
        emailType: "REGISTER",
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
            document.querySelector('#OTP-title').innerHTML = '<img style="height: 30px;" src="../../static/images/icons/icons8-yes-48.png"><br>Mail đã được gửi thành công <br> Nhập mã OTP vừa được gửi về mail của bạn:'
            document.querySelector('#OTP-title').classList.add('animate-fadeInUp');

            setTimeout(() => {
                document.querySelector('#OTP-title').classList.remove('animate-fadeInUp');
            }, 300);
        });

    return false; // Dừng form submission
}


function openOTPPopup() {
    document.getElementById('otp-popup').style.display = '';
    document.getElementById('overlay').style.display = '';
}

function openNextForm (){
    document.getElementById("register").style.display = "";
}

function validateOTP(event) {
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

    // Tạo dữ liệu request
    const otpRequest = {
        otp: otp,
        email: email
    };

    // Gửi yêu cầu đến API
    fetch("http://localhost:8080/email/validOTP", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(otpRequest)
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.code === 1000 && data.result) {
                alert("OTP chính xác! Đang chuyển sang bước tiếp theo...");

            } else {
                form.querySelector(".error").textContent = "OTP không đúng";
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            form.querySelector(".error").textContent = "Có lỗi xảy ra, vui lòng thử lại.";
        });

    return false;
}