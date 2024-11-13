function saveUserInfo() {
  // Lấy dữ liệu từ các trường trong modal
  const name = document.getElementById("modalName").value;
  const gender = document.getElementById("modalGender").value;
  const birthday = document.getElementById("modalBirthday").value;

  if (name && gender && birthday) {
    alert("Thông tin của bạn đã được cập nhật!");
    // Đóng modal sau khi lưu
    let modal = bootstrap.Modal.getInstance(
      document.getElementById("editInfoModal")
    );
    modal.hide();
  } else {
    alert("Vui lòng điền đầy đủ thông tin.");
  }
}

function savePassword() {
  const newPassword = document.getElementById("modalNewPassword").value;
  const confirmPassword = document.getElementById("modalConfirmPassword").value;

  if (
    newPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 8
  ) {
    alert("Mật khẩu của bạn đã được đổi thành công!");
    // Đóng modal sau khi lưu
    let modal = bootstrap.Modal.getInstance(
      document.getElementById("changePasswordModal")
    );
    modal.hide();
  } else {
    alert("Mật khẩu không hợp lệ hoặc không khớp. Vui lòng thử lại.");
  }
}

function changeAvatar() {
  // Mở hộp thoại chọn ảnh
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      alert("Ảnh đại diện của bạn đã được đổi!");
    }
  };
  input.click();
}

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

function fetchPersonalInformation() {
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  const accountId = "99549716-a124-4b79-abb5-3483e05d31ae";

  client.connect({}, function (frame) {
    client.debug = function (str) {}; // Tắt debug nếu không cần thiết
    client.send(`/app/getInfo/${accountId}`, {}, JSON.stringify(accountId));

    client.subscribe("/topic/getInformation", function (data) {
      const response = JSON.parse(data.body);
      const perInfo = response.result;
      const birthday =  convertISOToDateInput(perInfo.birthday);
    console.log(perInfo);
      // Chuỗi HTML lưu trữ thông tin người dùng
      const userInfoHTML = `
        <div class="col-md-8">
          <div class="section-header">Thông tin người dùng</div>
          <form>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Họ và Tên</label>
                <input type="text" class="form-control" placeholder="Họ và Tên" value="${perInfo.fullName}" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Giới tính</label>
                <input type="text" class="form-control" placeholder="Giới Tính" value="${perInfo.gender}" />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Sinh nhật</label>
                <input type="date" id="dateInput1" class="form-control" value="${birthday}" />
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
                <input type="email" class="form-control" placeholder="Email"  />
              </div>
              <div class="col-md-6">
                <label class="form-label">Mật khẩu</label>
                <input type="password" class="form-control" placeholder="Mật khẩu" />
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
                        <div class="mb-3">
                          <label class="form-label">Họ và Tên</label>
                          <input type="text" class="form-control" id="modalName" placeholder="Họ và Tên" />
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Giới tính</label>
                          <input type="text" class="form-control" id="modalGender" placeholder="Giới Tính" />
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Sinh nhật</label>
                          <input type="date" class="form-control" id="modalBirthday" />
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
              <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="changePasswordModalLabel">Đổi Mật Khẩu</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <form>
                        <div class="mb-3">
                          <label class="form-label">Mật khẩu mới</label>
                          <input type="password" class="form-control" id="modalNewPassword" placeholder="Mật khẩu mới" />
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Xác nhận mật khẩu mới</label>
                          <input type="password" class="form-control" id="modalConfirmPassword" placeholder="Xác nhận mật khẩu mới" />
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
                      <img src="\\WebChiaSeTaiLieu\\src\\main\\resources\\static\\images\\Ellipse 14.png" class="rounded-circle mb-3" alt="Profile" width="120" height="120" />
                      <h5 class="card-title">Quân sói đơn độc</h5>
                      <p class="card-text">Tôi là 1 con sói thích trẻ em à hú</p>
                      <button type="button" class="btn btn-secondary mt-3" onclick="changeAvatar()">Đổi ảnh đại diện</button>
                    </div>
                  </div>
                </div>
      `;

      // Gán HTML vào phần tử với id 'perInfo'
      document.getElementById("perInfo").innerHTML = userInfoHTML;
    });
  });
}




