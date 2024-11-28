function sendOTP(e, type) {
    e.preventDefault();

    // Lấy email từ input field
    const email = document.getElementById("mail").value;
    document.querySelector('.error').textContent = "";

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
                closeOTPPopup();
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

function nextFrame(){
    document.querySelector('.welcome').style.display = 'none';
    document.getElementById('info-form').style.display = '';
    document.getElementById('info-form').classList.add('animate-fadeInUp');
    setTimeout(() => {
        document.querySelector('#info-form').classList.remove('animate-fadeInUp');
    }, 500);
}

function validateOTP(event, type) {
    event.preventDefault();

    // Lấy giá trị từ input
    const otp = document.getElementById("OTP").value.trim();
    const email = document.getElementById("mail").value.trim();
    const form = document.getElementById('otp-form');

    // Kiểm tra input
    if (!otp || otp.length !== 6) {
        form.querySelector('.error').textContent = "OTP phải có đúng 6 ký tự.";
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

    closeOTPPopup()
    document.querySelector('#OTP-title').classList.add('animate-fadeInUp');

    setTimeout(() => {
        document.querySelector('#OTP-title').classList.remove('animate-fadeInUp');
    }, 500);

    document.querySelector('#get-otp').style.display = 'none';
    if(type == "REGISTER"){
        document.querySelector('#register').style.display = '';
        document.querySelector('#register').classList.add('animate-fadeInUp');
        setTimeout(() => {
            document.querySelector('#register').classList.remove('animate-fadeInUp');
        }, 500);
        setSession("nextform", type, 10);
    } else if (type == "FORGOT_PASSWORD") {
        document.querySelector('#resetpass').style.display = '';
        document.querySelector('#resetpass').classList.add('animate-fadeInUp');
        setTimeout(() => {
            document.querySelector('#resetpass').classList.remove('animate-fadeInUp');
        }, 500);
        setSession("nextform", type, 10);
    }
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

     if (nextForm === "REGISTER") {
        document.getElementById("get-otp").style.display = "none"; // Ẩn form 1
        if(document.getElementById("register")) {
            document.getElementById("register").style.display = ''; // Hiển thị form
        } else {
            document.getElementById("get-otp").style.display = ""; // Ẩn form 1
        }
    } else if (nextForm === "FORGOT_PASSWORD") {
        document.getElementById("get-otp").style.display = "none"; // Ẩn form 1
        if(document.getElementById("resetpass")) {
            document.getElementById("resetpass").style.display = ''; // Hiển thị form
        }else {
            document.getElementById("get-otp").style.display = ""; // Ẩn form 1
        }
    } else {
        document.getElementById("get-otp").style.display = ''; // Hiển thị form 1
        if(document.getElementById("register")) {
            document.getElementById("register").style.display = 'none'; // Hiển thị form
        }else{
            document.getElementById("resetpass").style.display = 'none'; // Hiển thị form
        }
    }
}

window.onload = checkForm;

function register(e) {
    e.preventDefault();

    // Lấy giá trị từ các input field
    const name = document.getElementById("name").value.trim();
    const password = document.getElementById("npass").value.trim();
    const confirmPassword = document.getElementById("repass").value.trim();

    // Xóa lỗi cũ
    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach(error => error.textContent = "");

    let hasError = false;

    // Kiểm tra rỗng và các điều kiện đầu vào
    if (!name) {
        document.querySelectorAll(".error")[1].textContent = "Họ và tên không được để trống.";
        hasError = true;
    } else if (name.length < 5) {
        document.querySelectorAll(".error")[1].textContent = "Họ và tên phải có ít nhất 5 ký tự.";
        hasError = true;
    }

    if (!password) {
        document.querySelectorAll(".error")[2].textContent = "Mật khẩu không được để trống.";
        hasError = true;
    } else if (password.length < 6) {
        document.querySelectorAll(".error")[2].textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
        hasError = true;
    }

    if (!confirmPassword) {
        document.querySelectorAll(".error")[3].textContent = "Vui lòng xác nhận mật khẩu.";
        hasError = true;
    } else if (password !== confirmPassword) {
        document.querySelectorAll(".error")[4].textContent = "Mật khẩu xác nhận không khớp.";
        hasError = true;
    }

    if (hasError) {
        return false; // Dừng việc gửi form nếu có lỗi
    }

    const button = document.getElementById('register-submit');
    button.textContent = "Đang xác nhận..."; // Đổi text
    button.classList.add('loading'); // Thêm class loading
    button.disabled = true; // Vô hiệu hóa nút

    // Payload yêu cầu
    const requestPayload = {
        name: name,
        password: password,
        email: document.getElementById("mail").value.trim() // Thêm email nếu cần
    };

    // Gửi API
    fetch("http://localhost:8088/account", {
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
                document.querySelectorAll(".error")[3].textContent = data.message || "Đăng ký không thành công."; // Thông báo lỗi từ API
            } else {
                document.querySelector('#overlay').style.display = ''
                document.querySelector('#success-popup').style.display = '';
            }
        })
        .catch(error => {
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
            console.error("Register error:", error);
        });

    return false; // Dừng form submission
}

function createPerInfo(e) {
    e.preventDefault();

    // Lấy giá trị từ các input fields
    const fullName = document.getElementById("fname").value.trim();
    const gender = document.getElementById("gender").value.trim();
    const birthday = document.getElementById("birthday").value;
    const email = document.getElementById("mail").value.trim();

    // Xóa thông báo lỗi cũ
    document.querySelectorAll(".error").forEach(errorDiv => errorDiv.textContent = "");

    let hasError = false;

    // Kiểm tra lỗi đầu vào và hiển thị lỗi
    if (!fullName) {
        setError("fname", "Họ tên không được để trống.");
        hasError = true;
    } else if (fullName.length < 5) {
        setError("fname", "Họ tên phải có ít nhất 5 ký tự.");
        hasError = true;
    }

    if (!gender || gender === "Chọn giới tính") {
        setError("gender", "Vui lòng chọn giới tính.");
        hasError = true;
    }

    if (!birthday) {
        setError("birthday", "Vui lòng chọn ngày sinh.");
        hasError = true;
    } else if (new Date(birthday) >= new Date()) {
        setError("birthday", "Ngày sinh không hợp lệ.");
        hasError = true;
    }

    if (hasError) {
        return false; // Dừng xử lý nếu có lỗi
    }

    // Payload yêu cầu
    const requestPayload = {
        fullName: fullName,
        gender: gender,
        birthday: birthday,
        email: email
    };

    // Gửi API
    fetch("http://localhost:8088/perInfo/register/add-info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
    })
        .then(response => response.json())
        .then(data => {
            // Xử lý kết quả từ API
            if (data.code && data.code !== 1000) {
                document.querySelector('.form-stitle').textContent = data.message || "Không thể tạo thông tin cá nhân.";
            } else {
                document.querySelector('.form-stitle').innerHTML = '<div class="spinner"></div><br>Đã tạo thông tin thành công, đang chuyển hướng về trang đăng nhập';
                setTimeout(() => {
                    window.location.href = "login.html"; // Đường dẫn tới trang login
                }, 5000); // 5000ms = 5 giây
            }
        })
        .catch(error => {
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
            console.error("Create PerInfo error:", error);
        });

    return false; // Dừng form submission
}

// Hàm đặt thông báo lỗi dưới input tương ứng
function setError(fieldId, message) {
    const inputField = document.getElementById(fieldId);
    const errorDiv = inputField.parentElement.nextElementSibling; // Lấy div.error kế tiếp
    if (errorDiv && errorDiv.classList.contains("error")) {
        errorDiv.textContent = message;
    }
}

function respass(event) {
    event.preventDefault(); // Ngăn chặn reload trang khi submit form

    const newPassword = document.getElementById('npass').value;
    const confirmPassword = document.getElementById('repass').value;
    const email = document.getElementById("mail").value.trim();
    document.querySelector("#otp-resend").style.display = "none";

    // Kiểm tra các điều kiện
    if (!newPassword || !confirmPassword) {
        document.querySelectorAll(".error")[1].textContent = "Vui lòng nhập mật khẩu";
        return false;
    }

    if (newPassword !== confirmPassword) {
        document.querySelectorAll(".error")[1].textContent = "Mật khẩu xác nhận không khớp";
        return false;
    }

    // Tạo payload
    const payload = {
        newPass: newPassword,
        email: email
    };

    // Gọi API bằng Fetch
    fetch('http://localhost:8088/account/forgetPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            // Xử lý phản hồi từ API
            if (!response.ok) {
                // Nếu response không thành công
                return response.json().then(err => {
                    throw new Error(err.message || "Đã xảy ra lỗi từ server");
                });
            }
            return response.json();
        })
        .then(result => {
            // Nếu thành công
            document.querySelector("#otp-resend").style.display = "";
            setTimeout(() => {
                window.location.href = "login.html"; // Đường dẫn tới trang login
            }, 5000);
        })
        .catch(error => {
            // Xử lý lỗi
            console.error("Lỗi khi gọi API:", error);
            document.querySelectorAll(".error")[1].textContent = error.message || "Đã xảy ra lỗi khi đổi mật khẩu.";
        });

    return false;
}



