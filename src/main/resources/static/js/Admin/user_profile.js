import {getToken} from "../Share/localStorageService.js";

function sendData(perInfo){
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



export function saveUserInfo() {
  // Lấy dữ liệu từ các trường trong modal
  const id=document.getElementById("accId").value;
  const name = document.getElementById("modalName").value;
  const gender = document.getElementById("modalGender").value;
  const birthday = document.getElementById("modalBirthday").value;
  const perInfo ={
    id:id,
    fullName:name,
    birthday:birthday,
    gender:gender
  }
  // console.log(perInfo);
  if (name && gender && birthday) {
    sendData(perInfo);
    let modal = bootstrap.Modal.getInstance(
      document.getElementById("editInfoModal")
    );
    modal.hide();
  } else {
    alert("Vui lòng điền đầy đủ thông tin.");
  }
}
window.saveUserInfo = saveUserInfo;

export function savePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const password = {
    oldPassword: oldPassword,
    newPassword: newPassword
  }
  console.log(password);

  const token = getToken();
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  if ( newPassword.length >= 6) {

    let modal = bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"));
    modal.hide();
    client.connect({Authorization: `Bearer ${token}`}, function (frame) {
      client.send("/app/updatePass",{},JSON.stringify(password));
      client.subscribe('/topic/updatePassword',function (data) {
        const result = JSON.parse(data);
        const message = result.message;
       // alert(message);
      })
    })
  } else {
    alert("Mật khẩu không hợp lệ. Vui lòng thử lại.");
  }



}
window.savePassword = savePassword;





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

export function fetchPersonalInformation() {
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  const token = getToken();
  client.debug = function (str) {};
  client.connect({Authorization: `Bearer ${token}`}, function (frame) {
   // Tắt debug nếu không cần thiết
    client.send(`/app/getInfo`);

    client.subscribe("/topic/getInfo", function (data) {
      const response = JSON.parse(data.body);
      const perInfo = response.result;
      const avatar = `../../static/images/User/${perInfo.avatar}`;
      const birthday =  convertISOToDateInput(perInfo.birthday);
      // Chuỗi HTML lưu trữ thông tin người dùng
      const userInfoHTML = `
        <div class="col-md-8">
          <div class="section-header">Thông tin người dùng</div>
          <form>
            <div class="row mb-3">
              <div class="col-md-6">
              
                <label class="form-label">Họ và Tên</label>
                <input type="text" class="form-control" placeholder="Họ và Tên" value="${perInfo.fullName}" readonly />
              </div>
              <div class="col-md-6">
                <label class="form-label">Giới tính</label>
                <input type="text" class="form-control" placeholder="Giới Tính" value="${perInfo.gender}" readonly/>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Sinh nhật</label>
                <input type="date" id="dateInput1" class="form-control" value="${birthday}" readonly />
              </div>
            </div>
            <div class="mb-3">
              <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editInfoModal">
                Đổi thông tin
              </button>
            </div>

            <div class="section-header mt-4">Thông tin tài khoản</div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" placeholder="Email" value="${perInfo.email}" readonly/>
              </div>
              <div class="col-md-6">
                <label class="form-label">Điểm của tài khoản</label>
                <input type="text" class="form-control" placeholder="Điểm" value="${perInfo.points}" readonly/>
              </div>
            </div>
            <div class="mb-3">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
                       Đổi mật khẩu 
                  </button>
            </div>
          </form>
        </div>
                    <div class="modal fade" id="editInfoModal" tabindex="-1" aria-labelledby="editInfoModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editInfoModalLabel">Đổi Thông Tin</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <form>
                        <input type="hidden" id="accId" value="${perInfo.accountId}"/>
                        <div class="mb-3">
                          <label class="form-label">Họ và Tên</label>
                          <input type="text" class="form-control" id="modalName" placeholder="Họ và Tên" value="${perInfo.fullName}"/>
                        </div>
                          <div class="mb-3">
                            <label class="form-label">Giới tính</label>
                            <select class="form-control" id="modalGender">
                              <option value="Male" ${perInfo.gender === "Male" ? "selected" : ""}>Male</option>
                              <option value="Female" ${perInfo.gender === "Female" ? "selected" : ""}>Female</option>
                            </select>
                          </div>
                         <div class="mb-3">
                          <label class="form-label">Sinh nhật</label>
                          <input type="date" class="form-control" id="modalBirthday" value="${birthday}"/>
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                      <button type="button" class="btn btn-primary" onclick="saveUserInfo()">Lưu Thay Đổi</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal Đổi Mật Khẩu -->
                <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">-->
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="changePasswordModalLabel">Đổi Mật Khẩu</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <form>
                        <div class="mb-3">
                          <label class="form-label">Nhập mật khẩu cũ</label>
                          <input type="text" class="form-control" id="oldPassword" placeholder="Mật khẩu mới" />
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Nhập mật khẩu mới</label>
                          <input type="text" class="form-control" id="newPassword" placeholder="Xác nhận mật khẩu mới" />
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                      <button type="button" class="btn btn-primary" onclick="savePassword()">Lưu Thay Đổi</button>
                    </div>
                  </div>
                </div>
              </div>
              

                <!-- Profile Card Section -->
                <div class="col-md-4">
                  <div class="card card-profile text-center">
                    <div class="card-body">
                      <img src="../../static/images/User/gấu đánh đàn.jpg" class="rounded-circle mb-3" alt="Profile" width="120" height="120" />
                      <h5 class="card-title">${perInfo.fullName}</h5>
                      <p class="card-text">Tôi là người quản lý web</p>
<!--                      <button type="button" class="btn btn-secondary mt-3" onclick="changeAvatar()">Đổi ảnh đại diện</button>-->
                    </div>
                  </div>
                </div>
                
      `;

      // Gán HTML vào phần tử với id 'perInfo'
      document.getElementById("perInfo").innerHTML = userInfoHTML;
    });
  });
}



