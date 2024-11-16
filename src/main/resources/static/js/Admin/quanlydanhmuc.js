// Initialize when page loads
import {getToken} from "../Share/localStorageService.js";

document.addEventListener("DOMContentLoaded", function () {
  renderCategories();
  updateFolderSelect();
});

// Show folder modal
export function showAddFolderModal() {
  const modal = document.getElementById("folderModal");
  const form = document.getElementById("folderForm");
  form.reset();
  document.getElementById("folderId").value = "";
  modal.style.display = "block";
}
window.showAddFolderModal = showAddFolderModal;

// Show group modal
export function showAddGroupModal() {
  const modal = document.getElementById("groupModal");
  const form = document.getElementById("groupForm");
  form.reset();
  document.getElementById("groupId").value = "";
  updateFolderSelect();
  modal.style.display = "block";
}
window.showAddGroupModal = showAddGroupModal;



// Close modals
function closeFolderModal() {
  document.getElementById("folderModal").style.display = "none";
}
window.closeFolderModal=closeFolderModal;

export function closeGroupModal(i) {
  if(i == 1){
    document.getElementById("groupModal").style.display = "none";
  }else{
    document.getElementById("groupModal-2").style.display = "none";
  }

}
window.closeGroupModal = closeGroupModal;

function SendData(data,message,server) {
  const token = getToken();
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  client.debug = function (str) {};
  client.connect({Authorization: `Bearer ${token}`}, function (frame) {
    client.send(message,{},JSON.stringify(data));
    client.subscribe(server, function (message) {
      const result = JSON.parse(message.body);
      //alert(result.message);
      window.location.reload();
    })
  })
}



// Handle folder submission
export function handleFolderSubmit(event) {
  event.preventDefault();

  const message = "/app/createMainCategory";
  const server = "/topic/createMain";
  const docCategoryRequest = {
    main: document.getElementById("folderName").value, // Tên danh mục chính
    sub: null // Nếu không có danh mục phụ, có thể để null
  };
  SendData(docCategoryRequest,message,server);
  updateFolderSelect();
  renderCategories();
  closeFolderModal();
}
window.handleFolderSubmit = handleFolderSubmit;

// Handle group submission
export function handleGroupSubmit(event) {
  event.preventDefault();

  const message = "/app/createMain&SubCategory";
  const server = "/topic/createCategory";
  const docCategoryRequest = {
    main: document.getElementById("folderSelect").options[document.getElementById("folderSelect").selectedIndex].text, // Tên danh mục chính
    sub: document.getElementById("groupName").value
  };
  console.log(docCategoryRequest);
  SendData(docCategoryRequest,message,server);
  renderCategories();
  closeGroupModal();
}
window.handleGroupSubmit = handleGroupSubmit;



export function handleGroupUpdateSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("groupId-2").value;
  const message = `/app/updateCategory/${id}`;
  const server = "/topic/updateCate";
  const docCategoryRequest = {
    main: document.getElementById("folderSelect-2").options[document.getElementById("folderSelect-2").selectedIndex].text, // Tên danh mục chính
    sub: document.getElementById("groupName-2").value
  };
  SendData(docCategoryRequest,message,server);
  renderCategories();
  closeGroupModal();
}
window.handleGroupUpdateSubmit = handleGroupUpdateSubmit;


// Update folder select options
function updateFolderSelect() {
  // Khởi tạo kết nối WebSocket
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  client.connect({}, function (frame) {
    client.debug = function (str) {};
    //console.log("Connected: " + frame);
    client.send("/app/allCategories");
    client.subscribe('/topic/getAllCategory', function (data) {
      const response = JSON.parse(data.body);
      const mainCategory = response.result;

      if (Array.isArray(mainCategory)) {
        const select = document.getElementById("folderSelect");
        const select2 = document.getElementById("folderSelect-2");
        select.innerHTML = '<option value="">Chọn danh mục</option>';
        select2.innerHTML = '<option value="">Chọn danh mục</option>';
        // Thêm từng danh mục vào select
        mainCategory.forEach((main) => {
          if (main.mainCategory && !main.subCategory) {
          //  const option = document.createElement("option");
            const option1 = document.createElement("option");
            option1.value = main.id;
            option1.textContent = main.mainCategory;
            select.appendChild(option1);

            // Tạo tùy chọn cho select thứ hai
            const option2 = document.createElement("option");
            option2.value = main.id;
            option2.textContent = main.mainCategory;
            select2.appendChild(option2);
          }
        });
      }
    }, function (error) {
      console.error("Lỗi khi kết nối WebSocket:", error);
    });
  }, function (error) {
    console.error("Không thể kết nối WebSocket:", error);
  });
}


// Render categories
function renderCategories() {
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  client.debug = function (str) {};
  client.connect({}, function (frame) {
    client.send("/app/allCategories");
    client.subscribe('/topic/getAllCategory', function (data) {
      const response = JSON.parse(data.body);
      const Categories = response.result;
      if (Array.isArray(Categories)) {
        var i =1;
        const tbody = document.getElementById("categoryTableBody");
        tbody.innerHTML = "";
        Categories.forEach((category) => {
          //const folder = folders.find((f) => f.id === parseInt(category.id));
          if(category.mainCategory && category.subCategory){
            const tr = document.createElement("tr");
            //var docNum = CountDocument(category.id,client);
            tr.innerHTML = `
      <td>${i}</td>
      <td id="mainCategory">${category.mainCategory}</td>
      <td id="subCategory">${category.subCategory}</td>
      <input type="hidden" id="categoryId" value="'${category.id}'"/>
      <td>
        <div class="action-buttons">
          <button class="btn btn-edit" id="editCategory">
            <i class="fas fa-edit"></i> Sửa
          </button>
          <button class="btn btn-delete">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </div>
      </td>
    `;
            i++;
            tbody.appendChild(tr);
          }
        });
      }
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("categoryTableBody");
  tbody.addEventListener("click", (event) => {
    if (event.target.closest(".btn-edit")) {
      const row = event.target.closest("tr"); // Lấy hàng cha của nút được nhấn
      const id = row.querySelector("#categoryId").value.replace(/'/g, ""); // Lấy ID, bỏ dấu '
      const main = row.querySelector("#mainCategory").textContent;
      const sub = row.querySelector("#subCategory").textContent;

      openEditCategory(id, main, sub);
    }
  });
});
// Edit category
function openEditCategory(id, main, sub) {
  const modal = document.getElementById("groupModal-2");
  document.getElementById("groupId-2").value = id;

  let selectElement = document.getElementById("folderSelect-2");
  for (let i = 0; i < selectElement.options.length; i++) {
    if (selectElement.options[i].textContent === main) {

      selectElement.options[i].selected = true;
      break;
    }
  }

  document.getElementById("groupName-2").value = sub;
  modal.style.display = "block";
}


document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("categoryTableBody");
  tbody.addEventListener("click", (event) => {
    if (event.target.closest(".btn-delete")) {
      const row = event.target.closest("tr"); // Lấy hàng cha của nút được nhấn
      const id = row.querySelector("#categoryId").value.replace(/'/g, "");
     deleteCategory(id);
    }
  });
});


function deleteCategory(id) {
  const modal = document.getElementById("confirmDeleteModal");
  modal.style.display = "block";
  // Thiết lập nút xác nhận xóa
  const confirmButton = modal.querySelector(".btn-confirm-delete");
  confirmButton.onclick = function () {
    const CategoryId = document.getElementById("groupId-2").value;
    const message = `/app/deleteCategory/${id}`;
    const server = "/topic/deleteCate";
    const docCategoryRequest = {
      main: null,
      sub: null
    };
    //console.log(message)
    SendData(docCategoryRequest,message,server);
    modal.style.display = "none";
  };


  // Thiết lập nút hủy
  const cancelButton = modal.querySelector(".btn-cancel-delete");
  cancelButton.onclick = function () {
    modal.style.display = "none";
  };
}


// Helper function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
}

// Close modals when clicking outside
window.onclick = function (event) {
  const folderModal = document.getElementById("folderModal");
  const groupModal = document.getElementById("groupModal");

  if (event.target === folderModal) {
    folderModal.style.display = "none";
  }
  if (event.target === groupModal) {
    groupModal.style.display = "none";
  }
};
document
  .getElementById("uploadForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", document.getElementById("documentTitle").value);
    formData.append(
      "category",
      document.getElementById("documentCategory").value
    );
    formData.append("file", document.getElementById("documentFile").files[0]);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.upload.onprogress = function (event) {
      const percentComplete = (event.loaded / event.total) * 100;
      document.querySelector(".progress-bar").style.width =
        percentComplete + "%";
      document
        .querySelector(".progress-bar")
        .setAttribute("aria-valuenow", percentComplete);
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        alert("Tài liệu đã được tải lên thành công!");
        // Optionally reset the form here
      } else {
        alert("Có lỗi xảy ra trong quá trình tải lên.");
      }
    };

    xhr.onerror = function () {
      alert("Lỗi kết nối.");
    };

    xhr.send(formData);
    document.querySelector(".progress").style.display = "block";
  });
