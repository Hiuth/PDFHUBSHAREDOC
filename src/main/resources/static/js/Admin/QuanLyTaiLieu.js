import {getToken} from "../Share/localStorageService.js";

// Đóng modal chỉnh sửa
export function closeEditModal() {
  document.getElementById("editDocumentModal").style.display = "none";
}


// Thêm sự kiện cho nút chỉnh sửa
document.querySelectorAll(".edit-button2").forEach((button) => {
  button.addEventListener("click", () =>
    openEditModal(button.closest("tr").cells[0].innerText)
  );
});

// Hàm tải xuống tài liệu
function downloadDocument(documentId) {
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "flex";
    client.connect({Authorization: `Bearer ${token}`},function(frame){
        client.send(`/app/downloadFile/${documentId}`,{},JSON.stringify(documentId));
        client.subscribe('/topic/downFile', function (message) {
            const result = JSON.parse(message.body);
            loadingElement.style.display = "none";

        })

    })
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
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
  // Giả lập việc xóa tài liệu
    client.debug = function (str) {};
    client.connect({Authorization: `Bearer ${token}`},function(frame){
        client.subscribe('/topic/deleteDocument', function (message) {
            const result = JSON.parse(message.body);
            //alert(result.message);
        })
        client.send(`/app/deleteDoc/${documentId}`,{},JSON.stringify(documentId));
        window.location.reload();
    })
}

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
export function closeDocumentDetailsModal() {
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

export function fetchAllDocuments() {
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




