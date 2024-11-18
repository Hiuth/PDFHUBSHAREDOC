// Hàm chuyển đổi trạng thái khóa/mở khóa


// Hàm mở modal chỉnh sửa thông tin khách hàng

// function handleButtonClick(button) {
//   const accountId = button.getAttribute('data-account-id');
//   const accountName = button.getAttribute('data-account-name');
//   const accountEmail = button.getAttribute('data-account-email');
//   const accountPassword = button.getAttribute('data-account-password');
//   openModal(accountId, accountName, accountEmail, accountPassword);
// }





// Hàm hiển thị modal chi tiết tài liệu
function showDocumentDetails(documentId) {
  const modal = document.getElementById("documentModal");
  // Giả lập việc lấy thông tin chi tiết tài liệu từ server
  const documentDetails = {
    id: documentId,
    title: "Tài liệu 1 " + documentId,
    category: documentId === "1" ? "Giáo dục" : "Công nghệ",
    type: documentId === "1" ? "PDF" : "DOCX",
    author: "User" + documentId,
    status: "Hợp lệ",
    description: "Đây là mô tả chi tiết về tài liệu " + documentId,
  };

  // Điền thông tin vào modal
  document.getElementById("documentId").textContent = documentDetails.id;
  document.getElementById("documentTitle").textContent = documentDetails.title;
  document.getElementById("documentCategory").textContent =
    documentDetails.category;
  document.getElementById("documentType").textContent = documentDetails.type;
  document.getElementById("documentAuthor").textContent =
    documentDetails.author;
  document.getElementById("documentStatus").textContent =
    documentDetails.status;
  document.getElementById("documentDescription").textContent =
    documentDetails.description;

  modal.style.display = "block";
}

// Hàm tải xuống tài liệu
function downloadDocument(documentId) {
  // Giả lập việc tải xuống tài liệu
  alert("Đang tải xuống tài liệu " + documentId);
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
  // Giả lập việc xóa tài liệu
  alert("Đã xóa tài liệu " + documentId);
  // Ở đây bạn sẽ gọi API để xóa tài liệu
  // Sau đó xóa hàng khỏi bảng
  const row = document.querySelector(`tr[data-document-id="${documentId}"]`);
  if (row) {
    row.remove();
  }
}

// Đóng modal khi nhấp vào nút X hoặc bên ngoài modal
document.querySelectorAll(".close-modal").forEach((button) => {
  button.onclick = function () {
    document.getElementById("documentModal").style.display = "none";
  };
});

// Đóng modal khi nhấp vào khu vực bên ngoài modal
window.onclick = function (event) {
  const documentModal = document.getElementById("documentModal");
  const confirmModal = document.getElementById("confirmDeleteModal");
  if (event.target === documentModal) {
    documentModal.style.display = "none";
  }
  if (event.target === confirmModal) {
    confirmModal.style.display = "none";
  }
};

// Thiết lập các sự kiện cho các nút hành động
document.addEventListener("DOMContentLoaded", function () {
  // Thêm xử lý sự kiện cho nút xem chi tiết
  document.querySelectorAll(".edit-button2").forEach((button) => {
    button.onclick = function () {
      const documentId = this.closest("tr").getAttribute("data-document-id");
      showDocumentDetails(documentId);
    };
  });

  // Thêm xử lý sự kiện cho nút tải xuống
  document.querySelectorAll(".download-button").forEach((button) => {
    button.onclick = function () {
      const documentId = this.closest("tr").getAttribute("data-document-id");
      downloadDocument(documentId);
    };
  });

  // Thêm xử lý sự kiện cho nút xóa
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.onclick = function () {
      const documentId = this.closest("tr").getAttribute("data-document-id");
      showDeleteConfirmation(documentId);
    };
  });
});
// Khởi tạo biểu đồ khi trang đã load
document.addEventListener("DOMContentLoaded", function () {
  // Cấu hình chung cho tất cả biểu đồ
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  // Biểu đồ người dùng
  const userCtx = document.getElementById("userChart").getContext("2d");
  new Chart(userCtx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Số người dùng",
          data: [
            1000, 1500, 2200, 2800, 3500, 4200, 4800, 5000, 5200, 5400, 5800,
            6000,
          ],
          borderColor: "#8e2de2",
          tension: 0.4,
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Biểu đồ phân bố tài liệu
  const docCtx = document.getElementById("documentChart").getContext("2d");
  new Chart(docCtx, {
    type: "pie",
    data: {
      labels: ["PDF", "Word", "Khác"],
      datasets: [
        {
          data: [450, 300, 200],
          backgroundColor: ["#8e2de2", "#4a00e0", "#7c3aed"],
        },
      ],
    },
    options: commonOptions,
  });

  // Biểu đồ lượt tải
  const downloadCtx = document.getElementById("downloadChart").getContext("2d");
  new Chart(downloadCtx, {
    type: "bar",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Lượt tải",
          data: [200, 350, 450, 400, 600, 550, 700, 650, 680, 720, 750, 800],
          backgroundColor: "#4a00e0",
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const accountCtx = document.getElementById("accountChart").getContext("2d");

  const weekData = [10, 15, 12, 30, 25, 18, 22];
  const monthData = [120, 150, 130, 170, 140];
  const yearData = [1200, 1500, 1300, 1700, 1400, 1600, 1800];

  const labelsWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const labelsMonth = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const labelsYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  let accountChart = new Chart(accountCtx, {
    type: "bar",
    data: {
      labels: labelsWeek,
      datasets: [
        {
          label: "Tài khoản đăng ký",
          data: weekData,
          backgroundColor: "#4a00e0",
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
      },
    },
  });
  // Event listeners for the time period buttons
  document.getElementById("weekBtn").addEventListener("click", function () {
    accountChart.data.labels = labelsWeek;
    accountChart.data.datasets[0].data = weekData;
    accountChart.update();
  });

  document.getElementById("monthBtn").addEventListener("click", function () {
    accountChart.data.labels = labelsMonth;
    accountChart.data.datasets[0].data = monthData;
    accountChart.update();
  });

  document.getElementById("yearBtn").addEventListener("click", function () {
    accountChart.data.labels = labelsYear;
    accountChart.data.datasets[0].data = yearData;
    accountChart.update();
  });
});
let categories = [
  {
    id: 1,
    name: "Giáo dục",
    description: "Tài liệu giáo dục và học tập",
    documentCount: 25,
    createdAt: "2024-01-15",
    parentId: null,
  },
  {
    id: 2,
    name: "Công nghệ",
    description: "Tài liệu về công nghệ thông tin",
    documentCount: 30,
    createdAt: "2024-01-16",
    parentId: null,
  },
];

// Khởi tạo khi trang được load
document.addEventListener("DOMContentLoaded", function () {
  renderCategories();
  populateParentCategories();
});

// Render danh sách danh mục
function renderCategories() {
  const tbody = document.getElementById("categoryTableBody");
  tbody.innerHTML = "";

  categories.forEach((category) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${category.id}</td>
      <td>${category.name}</td>
      <td>${category.description}</td>
      <td>${category.documentCount}</td>
      <td>${formatDate(category.createdAt)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="editCategory(${category.id})">
            <i class="fas fa-edit"></i> Sửa
          </button>
          <button class="btn-delete" onclick="deleteCategory(${category.id})">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Điền danh mục cha vào dropdown
function populateParentCategories() {
  const select = document.getElementById("parentCategory");
  select.innerHTML = '<option value="">-- Chọn danh mục cha --</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

// Hiển thị modal thêm danh mục
function showAddCategoryModal() {
  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("categoryForm");

  modalTitle.textContent = "Thêm danh mục mới";
  form.reset();
  document.getElementById("categoryId").value = "";

  modal.style.display = "block";
}

// Đóng modal
function closeCategoryModal() {
  document.getElementById("categoryModal").style.display = "none";
}

// Xử lý submit form
function handleCategorySubmit(event) {
  event.preventDefault();

  const categoryId = document.getElementById("categoryId").value;
  const formData = {
    name: document.getElementById("categoryName").value,
    description: document.getElementById("categoryDescription").value,
    parentId: document.getElementById("parentCategory").value || null,
    documentCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };

  if (categoryId) {
    // Cập nhật danh mục hiện có
    const index = categories.findIndex((c) => c.id === parseInt(categoryId));
    categories[index] = { ...categories[index], ...formData };
  } else {
    // Thêm danh mục mới
    formData.id = categories.length + 1;
    categories.push(formData);
  }

  renderCategories();
  populateParentCategories();
  closeCategoryModal();
}

// Chỉnh sửa danh mục
function editCategory(id) {
  const category = categories.find((c) => c.id === id);
  if (!category) return;

  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");

  modalTitle.textContent = "Chỉnh sửa danh mục";
  document.getElementById("categoryId").value = category.id;
  document.getElementById("categoryName").value = category.name;
  document.getElementById("categoryDescription").value = category.description;
  document.getElementById("parentCategory").value = category.parentId || "";

  modal.style.display = "block";
}

// Xóa danh mục
let categoryToDelete = null;

function deleteCategory(id) {
  categoryToDelete = id;
  document.getElementById("confirmDeleteModal").style.display = "block";
}

function confirmDeleteCategory() {
  if (categoryToDelete) {
    categories = categories.filter((c) => c.id !== categoryToDelete);
    renderCategories();
    populateParentCategories();
    closeConfirmDeleteModal();
  }
}

function closeConfirmDeleteModal() {
  document.getElementById("confirmDeleteModal").style.display = "none";
  categoryToDelete = null;
}

// Hàm hỗ trợ format ngày tháng
function formatDate(dateString) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
}

// Đóng modal khi click bên ngoài
window.onclick = function (event) {
  const categoryModal = document.getElementById("categoryModal");
  const confirmModal = document.getElementById("confirmDeleteModal");
  if (event.target === categoryModal) {
    categoryModal.style.display = "none";
  }
  if (event.target === confirmModal) {
    confirmModal.style.display = "none";
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

