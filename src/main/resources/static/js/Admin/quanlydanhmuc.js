// Data structure
let folders = [];
let categories = [];

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  renderCategories();
  updateFolderSelect();
});

// Show folder modal
function showAddFolderModal() {
  const modal = document.getElementById("folderModal");
  const form = document.getElementById("folderForm");
  form.reset();
  document.getElementById("folderId").value = "";
  modal.style.display = "block";
}

// Show group modal
function showAddGroupModal() {
  const modal = document.getElementById("groupModal");
  const form = document.getElementById("groupForm");
  form.reset();
  document.getElementById("groupId").value = "";
  updateFolderSelect();
  modal.style.display = "block";
}

// Close modals
function closeFolderModal() {
  document.getElementById("folderModal").style.display = "none";
}

function closeGroupModal(i) {
  if(i == 1){
    document.getElementById("groupModal").style.display = "none";
  }else{
    document.getElementById("groupModal-2").style.display = "none";
  }

}


function SendData(data,message,server) {
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  client.connect({}, function (frame) {
    client.debug = function (str) {};
    client.subscribe(server, function (message) {
      const result = JSON.parse(message.body);
      alert(result.message);
    })
    //console.log(message,server);
    client.send(message,{},JSON.stringify(data));
  })
}



// Handle folder submission
function handleFolderSubmit(event) {
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

// Handle group submission
function handleGroupSubmit(event) {
  event.preventDefault();

  // const groupId = document.getElementById("groupId").value;
  // const formData = {
  //   folderId: document.getElementById("folderSelect").value,
  //   groupName: document.getElementById("groupName").value,
  //   documentCount: 0,
  //   createdAt: new Date().toISOString().split("T")[0],
  // };
  //
  // if (groupId) {
  //   // Update existing group
  //   const index = categories.findIndex((c) => c.id === parseInt(groupId));
  //   categories[index] = { ...categories[index], ...formData };
  // } else {
  //   // Add new group
  //   formData.id = categories.length + 1;
  //   categories.push(formData);
  // }
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

function handleGroupUpdateSubmit(event) {
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
// Update folder select options
function updateFolderSelect() {
  // Khởi tạo kết nối WebSocket
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  client.connect({}, function (frame) {
    client.debug = function (str) {};
    //console.log("Connected: " + frame);
    client.send("/app/allCategory");
    client.subscribe('/topic/getAll', function (data) {
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
            option2.value = main.id; // Nếu cần, có thể thay đổi giá trị tùy theo logic
            option2.textContent = main.mainCategory; // Nếu cần, có thể thay đổi văn bản tùy theo logic
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

// function CountDocument(cateId,client){
//   client.send(`/app/DocumentsByCategoryId/${cateId}`, {}, JSON.stringify({cateId}));
//   client.subscribe('/topic/getDocumentsByCategoryId', function (data) {
//     const response = JSON.parse(data.body);
//     const documents = response.result;
//     const numberDoc = 0;
//     if (Array.isArray(documents)) {
//       documents.forEach((doc) => {
//         console.log("tentailieu: ",doc.name);
//         console.log(doc);
//         console.log("số lượng tài liệu",numberDoc);
//         //console.log("so luong tai lieu",numberDoc);
//       })
//     }else {
//       console.error("Expected an array but received:", documents);
//     }
//   })
// }


// Render categories
function renderCategories() {
  const socket = new SockJS("http://localhost:8088/ws");
  const client = Stomp.over(socket);
  client.connect({}, function (frame) {
    client.debug = function (str) {};
    client.subscribe('/topic/getAll', function (data) {
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
      <td>${category.mainCategory}</td>
      <td>${category.subCategory}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-edit" onclick="openEditCategory('${category.id}','${category.mainCategory}','${category.subCategory}')">
            <i class="fas fa-edit"></i> Sửa
          </button>
          <button class="btn btn-delete" onclick="deleteCategory('${category.id}')">
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

// Edit category
function openEditCategory(id,main,sub) {
  //const category = categories.find((c) => c.id === id);
  const modal = document.getElementById("groupModal-2");
  document.getElementById("groupId-2").value = id;
  document.getElementById("folderSelect-2").options = main;
  document.getElementById("groupName-2").value = sub;
  modal.style.display = "block";
}

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
// Delete category


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
