
// Hiển thị modal chỉnh sửa tài liệu
function openEditModal(docId,docName,mainCategory,subCategory,type,account,point,description) {
  document.getElementById("editDocumentModal").style.display = "flex";
  // Gán giá trị cho các trường modal dựa trên documentId
  document.getElementById("documentId").value = docId;
  document.getElementById("documentTitle").value = docName;
  document.getElementById("documentCategory").value = mainCategory;
  document.getElementById("documentGroup").value = subCategory;
  document.getElementById("documentType").value = type;
  document.getElementById("documentAuthor").value = account;
  document.getElementById("documentPoint").value = point;
  document.getElementById("documentDescription").value = description;
}

// Đóng modal chỉnh sửa
function closeEditModal() {
  document.getElementById("editDocumentModal").style.display = "none";
}

// Lưu thay đổi tài liệu
function saveDocumentChanges() {
  alert("Đã lưu thay đổi tài liệu!");
  closeEditModal();
}

// Thêm sự kiện cho nút chỉnh sửa
document.querySelectorAll(".edit-button2").forEach((button) => {
  button.addEventListener("click", () =>
    openEditModal(button.closest("tr").cells[0].innerText)
  );
});

// Hàm tải xuống tài liệu
function downloadDocument(documentId) {
  // Giả lập việc tải xuống tài liệu
    client.send("");

}

// Hàm hiển thị xác nhận xóa
function showDeleteConfirmation(documentId) {
  const modal = document.getElementById("confirmDeleteModal");
  modal.style.display = "block";
  // Thiết lập nút xác nhận xóa
  const confirmButton = modal.querySelector(".btn-confirm-delete");
  confirmButton.onclick = function () {
    deleteDocument(documentId);
    modal.style.display = "none";
  };

  // Thiết lập nút hủy
  const cancelButton = modal.querySelector(".btn-cancel-delete");
  cancelButton.onclick = function () {
    modal.style.display = "none";
  };
}

// Hàm xóa tài liệu
function deleteDocument(documentId) {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
  // Giả lập việc xóa tài liệu
    client.connect({},function(frame){
        client.debug = function (str) {};
        console.log(frame);
        client.subscribe('/topic/deleteDocument', function (message) {
            const result = JSON.parse(message.body);
            alert(result.message);
        })
        client.send(`/app/deleteDoc/${documentId}`,{},JSON.stringify(documentId));
    })
}

// Thiết lập các sự kiện cho các nút hành động
// document.addEventListener("DOMContentLoaded", function () {
//   // Thêm xử lý sự kiện cho nút xem chi tiết
//   document.querySelectorAll(".edit-button2").forEach((button) => {
//     button.onclick = function () {
//       const documentId = this.closest("tr").getAttribute("data-document-id");
//       showDocumentDetails(documentId);
//     };
//   });
//
//   // Thêm xử lý sự kiện cho nút tải xuống
//   document.querySelectorAll(".download-button").forEach((button) => {
//     button.onclick = function () {
//       const documentId = this.closest("tr").getAttribute("data-document-id");
//       downloadDocument(documentId);
//     };
//   });
//
//   // Thêm xử lý sự kiện cho nút xóa
//   document.querySelectorAll(".delete-button").forEach((button) => {
//     button.onclick = function () {
//       const documentId = this.closest("tr").getAttribute("data-document-id");
//       showDeleteConfirmation(documentId);
//     };
//   });
// });

// Hiển thị modal Chi tiết tài liệu
function openDocumentDetails(documentId, title, category, group, type, point, status) {
    //console.log(documentId);
  document.getElementById("documentDetailsModal").style.display = "block";
  //document.getElementById("detailDocumentId").innerText = documentId;
  document.getElementById("detailDocumentTitle").innerText = title;
  document.getElementById("detailDocumentCategory").innerText = category;
  document.getElementById("detailDocumentGroup").innerText = group;
  document.getElementById("detailDocumentType").innerText = type;
  document.getElementById("detailDocumentAuthor").innerText = point;
  document.getElementById("detailDocumentStatus").innerText = status;
  //console.log(documentId);

}

//Thêm sự kiện cho các nút "Xem Chi Tiết"
document.querySelectorAll(".view-details-button").forEach((button) => {
  button.addEventListener("click", function () {
    const row = this.closest("tr").cells;
    openDocumentDetails(
      row[0].innerText,
      row[1].innerText,
      row[2].innerText,
      row[3].innerText,
      row[4].innerText,
      row[5].innerText,
    );
  });
});

// Đóng modal Chi tiết tài liệu
function closeDocumentDetailsModal() {
  const documentModal = document.getElementById("documentDetailsModal");
  documentModal.style.display = "none";
}

// Thêm sự kiện cho nút đóng modal
const closeButton = document.querySelector(
  "#documentDetailsModal .close-modal"
);
closeButton.addEventListener("click", closeDocumentDetailsModal);

// Đóng modal khi nhấp chuột ra ngoài modal
window.addEventListener("click", (event) => {
  const documentModal = document.getElementById("documentDetailsModal");
  if (event.target === documentModal) {
    closeDocumentDetailsModal();
  }
});

function fetchAllDocuments() {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {};
        //console.log("Connected: " + frame);
        client.send("/app/allDocuments");  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
        // Nhận danh sách tài khoản từ server và hiển thị trong bảng
        client.subscribe('/topic/Documents', function (data) {
            const response = JSON.parse(data.body);
            const documents = response.result
            if(Array.isArray(documents)) {
                var i = 1;
                const tbody = document.querySelector('.user-table tbody');
                tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
                documents.forEach(doc => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                 <tr>
                  <td>${i}</td>
                  <td>${doc.name}</td>
                  <td>${doc.category.mainCategory}</td>
                  <td>${doc.category.subCategory}</td>
                  <td>${doc.type}</td>
                  <td>${doc.createdBy.name}</td>
                  <td>${doc.point}</td>
                  <td>
                    <button class="edit-button2">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="download-button">
                      <i class="fas fa-download"></i>
                     <button class="view-details-button">
                      <i class="fas fa-edit"></i>
                    </button>
                    </button>
                    <button class="delete-button">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
                `;
                    row.querySelector(".edit-button2").onclick = function () {
                        openDocumentDetails(doc.id, doc.name, doc.category.mainCategory, doc.category.subCategory, doc.type, doc.createdBy.name, doc.point);
                    };
                    row.querySelector(".download-button").onclick = function () {
                        downloadDocument(doc.id);
                    };
                    row.querySelector(".view-details-button").onclick = function () {
                        openEditModal(doc.id, doc.name, doc.category.mainCategory, doc.category.subCategory, doc.type, doc.createdBy.name, doc.point,doc.description);
                    };
                    row.querySelector(".delete-button").onclick = function () {
                        showDeleteConfirmation(doc.id);
                    };
                    tbody.appendChild(row);
                    i++;
                });
            }else {
                console.error("Expected an array but received:", documents);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Thêm xử lý sự kiện cho nút search
    const searchButton = document.getElementById("docButton");
    const searchInput = document.getElementById("searchDoc");

    // Kiểm tra xem các phần tử có tồn tại trước khi gán sự kiện
    if (searchButton && searchInput) {
        searchButton.addEventListener("click", function () {
            const query = searchInput.value;
            searchDocument(query)
        });

        // Sự kiện nhấn Enter trên ô input
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                searchButton.click();
            }
        });
    }
});


function searchDocument(docName){
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {};
        //console.log("Connected: " + frame);
        client.send(`/app/findDoc/${docName}`,{},JSON.stringify(docName));  // Gửi yêu cầu WebSocket để lấy danh sách tài khoản
        // Nhận danh sách tài khoản từ server và hiển thị trong bảng
        client.subscribe('/topic/findDocument', function (data) {
            const response = JSON.parse(data.body);
            const documents = response.result
            if(Array.isArray(documents)) {
                var i = 1;
                const tbody = document.querySelector('.user-table tbody');
                tbody.innerHTML = ''; // Xóa nội dung cũ trong bảng
                documents.forEach(doc => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                  <td>${i}</td>
                  <td>${doc.name}</td>
                  <td>${doc.category.mainCategory}</td>
                  <td>${doc.category.subCategory}</td>
                  <td>${doc.type}</td>
                  <td>${doc.createdBy.name}</td>
                  <td>${doc.point}</td>
                  <td>
                    <button class="edit-button2">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="download-button">
                      <i class="fas fa-download"></i>
                     <button class="view-details-button">
                      <i class="fas fa-edit"></i>
                    </button>
                    </button>
                    <button class="delete-button">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                `;
                    row.querySelector(".edit-button2").onclick = function () {
                        openDocumentDetails(doc.id, doc.name, doc.category.mainCategory, doc.category.subCategory, doc.type, doc.createdBy.name, doc.point);
                    };
                    row.querySelector(".download-button").onclick = function () {
                        downloadDocument(doc.id);
                    };
                    row.querySelector(".view-details-button").onclick = function () {
                        openEditModal(doc.id, doc.name, doc.category.mainCategory, doc.category.subCategory, doc.type, doc.createdBy.name, doc.point,doc.description);
                    };
                    row.querySelector(".delete-button").onclick = function () {
                        showDeleteConfirmation(doc.id);
                    };
                    tbody.appendChild(row);
                    i++;
                });
            }else {
                console.error("Expected an array but received:", documents);
            }
        });
    });
}
