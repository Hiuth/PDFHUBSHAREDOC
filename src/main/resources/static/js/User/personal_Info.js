import {getToken} from "../Share/localStorageService.js";

function convertISOToDateInput(isoString) {
    // Tạo đối tượng Date từ chuỗi ISO
    const date = new Date(isoString);

    // Lấy các thành phần ngày, tháng, năm
    const year = date.getFullYear();
    // Thêm 0 phía trước nếu tháng < 10
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // Thêm 0 phía trước nếu ngày < 10
    const day = date.getDate().toString().padStart(2, '0');

    // Ghép lại theo định dạng YYYY-MM-DD
    return `${year}-${month}-${day}`;
}



export function PersonalInfo() {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    client.connect({Authorization: `Bearer ${token}`}, function (frame){
        client.send(`/app/getInfo`);
        client.subscribe("/topic/getInfo", function (data) {
            const response = JSON.parse(data.body);
            const perInfo = response.result
            const birthday =convertISOToDateInput(perInfo.birthday);

            const avatarElement = document.getElementById("avatar2");
            if (perInfo.avatar && perInfo.avatar.trim() !== "") {
                avatarElement.src = `../../static/images/User/${perInfo.avatar}`;
            }

            const innerHTML =`
             <form class="form-group1" id="infoChange">
                        <input type="hidden" id="accountId" value="${perInfo.accountId}"/>
                        <div class="form-group2">
                            <div class="label">Thông tin người dùng</div>
                            <a onclick="ChangeInfo()">Thay đổi</a>
                            <a onclick="ConfirmChangeInfo()" style="display: none;">Lưu</a>
                        </div>
                        <div class="ChangeTitle" style="display: none;">Thay đổi trực tiếp các thông tin cần thiết ngay bên dưới</div>
                        <div class="form-group2" id="read-class">
                            <div class="static">Họ và tên</div>
                            <input class="read" value="${perInfo.fullName}" id="fullname" readonly>
                        </div>
                        <div class="error"></div>
                        <div class="form-group2" id="read-class">
                            <div class="static">Giới tính</div>
                            <select class="read" value="${perInfo.gender}" id="gender" disabled>
                                <option value="Male">Nam</option>
                                <option value="Female">Nữ</option>
                            </select>
                        </div>
                        <div class="error"></div>
                        <div class="form-group2" id="read-class">
                            <div class="static">Sinh nhật</div>
                            <input type="date" style="padding-left: 15px" class="read" value="${birthday}" id="birthday" readonly>
                        </div>
                        <div class="error"></div>
                    </form>
                                        <div class="form-group1" id="mailAndPass">
                        <div class="form-group2">
                            <div class="label">Thông tin tài khoản</div>
                        </div>
                        <div class="ChangeTitle" style="display: none;">Thay đổi trực tiếp mật khẩu ngay bên dưới</div>
                        <div class="form-group2" id="read-class">
                            <div class="static">Email</div>
                            <div class="read" id="mail">${perInfo.email}</div>
                        </div>
                        <form class="form-group2" id="read-class passChange">
                            <div class="static">Số xu</div>
                            <input type="text" style="padding-left: 15px" class="read" id="pass" value="${perInfo.points}" readonly>
                            <a onclick="openChangePass()">Thay đổi</a>
                            <a onclick="ConfirmChangePass()" style="display: none;">Lưu</a>
                        </form>
                        <div class="error"></div>
                    </div>
            `;
            document.getElementById("acc").innerHTML = innerHTML;
        })
    });
}


export function ChangeInfo() {
    // Ẩn nút 'Thay đổi' và hiển thị nút 'Lưu'
    document.querySelector("a[onclick='ChangeInfo()']").style.display = 'none';
    document.querySelector("a[onclick='ConfirmChangeInfo()']").style.display = '';

    // Hiển thị thông báo thay đổi
    document.querySelector(".ChangeTitle").style.display = '';

    // Lấy tất cả các input có class 'read' trong form với id 'infoChange'
    document.querySelectorAll("#infoChange .read").forEach(input => {
        input.removeAttribute("readonly");
        input.removeAttribute("disabled")
        input.style.pointerEvents = "auto"; // Cho phép click vào
        input.style.border = "1px solid #ccc"; // Đặt viền khi có thể chỉnh sửa
    });
}
window.ChangeInfo = ChangeInfo;

function sendDataPer(perInfo){
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
        client.debug = function (str) {}; // Tắt debug nếu không cần thiết
        client.send(`/app/addInfo`, {}, JSON.stringify(perInfo));

        client.subscribe("/topic/addInformation", function (data) {
            window.location.reload();
        });
    });
}


export function ConfirmChangeInfo() {
    let isValid = true;
    const infoChange = document.forms["infoChange"]; // Reference to the form
    // Get input values using the form reference
    const fullname = infoChange.elements["fullname"].value.trim();
    const gender = infoChange.elements["gender"].value.trim();
    const birthday = infoChange.elements["birthday"].value.trim();
    const id = document.getElementById("accountId").value;
    // Error elements within the form
    const errorElements = infoChange.querySelectorAll(".error");

    // Check if fullname is not empty
    if (fullname === "") {
        errorElements[0].textContent = "Họ và tên không được để trống.";
        isValid = false;
    } else {
        errorElements[0].textContent = "";
    }

    // Check if gender is not empty and is valid
    if (gender === "") {
        errorElements[1].textContent = "Giới tính không được để trống.";
        isValid = false;
    } else if (gender !== "Male" && gender !== "Female") {
        errorElements[1].textContent = "Giới tính chỉ có thể là Nam hoặc Nữ";
        isValid = false;
    } else {
        errorElements[1].textContent = "";
    }

    // Check if birthday is not empty and in the correct format
    if (birthday === "") {
        errorElements[2].textContent = "Ngày sinh không được để trống.";
        isValid = false;
    } else {
        errorElements[2].textContent = "";
    }

    // If all fields are valid, submit the form
    if (isValid) {
        const personalInfo = {
            id: id,
            fullName: fullname,
            birthday: birthday,
            gender: gender

        }
        console.log(personalInfo);
        sendDataPer(personalInfo);
    }
}
window.ConfirmChangeInfo=ConfirmChangeInfo;

export function updatePassWord(event){
    event.preventDefault();
    const form = event.target;
    const oldPassword = form.querySelector('#oldPass').value;
    const newPassword = form.querySelector('#newPass').value;
    const password = {
        oldPassword: oldPassword,
        newPassword: newPassword
    }
    console.log(password);

    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    if ( newPassword.length >= 6) {
        client.connect({Authorization: `Bearer ${token}`}, function (frame) {
            client.send("/app/updatePass",{},JSON.stringify(password));
            client.subscribe('/topic/updatePassword',function (data) {
                // const result = JSON.parse(data);
                // const message = result.message;
                window.location.reload();
            })
        })
    } else {
        alert("Mật khẩu không hợp lệ. Vui lòng thử lại.");
    }
}

window.updatePassWord=updatePassWord;

export function updateAvatar(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const form = event.target;

    // Get the selected avatar
    const selectedAvatar = form.querySelector('#selectedAvatar').value;

    const token = getToken(); // Get the token for authorization (assuming you have a getToken function)
    const socket = new SockJS("http://localhost:8088/ws"); // Create a WebSocket connection
    const client = Stomp.over(socket); // Initialize Stomp client

    console.log(selectedAvatar);

    if (selectedAvatar) {
        client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
            // Send the avatar data to the server via WebSocket
            client.send(`/app/updateAvatar/${selectedAvatar}`, {}, JSON.stringify());

            // Subscribe to the response channel for update completion
            client.subscribe('/topic/updateAvatar', function (data) {
                // Handle the server response (e.g., reload the page or update the avatar)
                const result = JSON.parse(data.body); // Parse the server response
                if (result.code === 1000) {
                    alert("Cập nhật ảnh đại diện thành công!");
                    window.location.reload(); // Reload the page to show the updated avatar
                } else {
                    alert("Có lỗi xảy ra khi cập nhật ảnh đại diện. Vui lòng thử lại.");
                }
            });
        });
    } else {
        alert("Vui lòng chọn ảnh đại diện.");
    }
}

window.updateAvatar=updateAvatar;