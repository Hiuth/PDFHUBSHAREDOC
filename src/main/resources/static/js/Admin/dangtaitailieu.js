import {getToken} from "../Share/localStorageService.js";

async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:8088/docCategory/get-all'); // Đảm bảo URL chính xác
        const data = await response.json();

        if (data.result) {
            populateCategoryOptions(data.result);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

// Hàm để thêm các danh mục vào documentCategory
function populateCategoryOptions(categories) {
    const categorySelect = document.getElementById("folderSelect");

    // Tạo một tập hợp để loại bỏ các danh mục trùng lặp
    const uniqueMainCategories = [...new Set(categories.map(category => category.mainCategory))];

    // Xóa các tùy chọn cũ, trừ "Chọn danh mục"
    categorySelect.innerHTML = '<option value="" selected>Chọn danh mục</option>';

    uniqueMainCategories.forEach(mainCategory => {
        const option = document.createElement("option");
        option.value = mainCategory;
        option.textContent = mainCategory;
        categorySelect.appendChild(option);
    });

    // Thêm sự kiện khi thay đổi danh mục để cập nhật nhóm tương ứng
    categorySelect.addEventListener("change", function() {
        const selectedCategory = this.value;
        const subCategories = categories
            .filter(category => category.mainCategory === selectedCategory)
            .map(category => ({
                id: category.id, // hoặc bất kỳ trường id nào của bạn
                subCategory: category.subCategory
            }));
        populateGroupOptions(subCategories);
    });
}

// Hàm để thêm các nhóm vào documentGroup
function populateGroupOptions(subCategories) {
    const groupSelect = document.getElementById("groupSelect");

    // Xóa các tùy chọn cũ, trừ "Chọn nhóm"
    groupSelect.innerHTML = '<option value="" disabled selected>Chọn nhóm</option>';

    subCategories.forEach(subCategory => {
        if(subCategory.subCategory && subCategory.subCategory.trim() !== ""){
            const option = document.createElement("option");
            option.value = subCategory.id;
            option.textContent = subCategory.subCategory;
            groupSelect.appendChild(option);
        }

    });
}
// Gọi hàm fetch khi trang tải xong
document.addEventListener("DOMContentLoaded", fetchCategories);


export function upDocument() {
    const loadingElement = document.getElementById("loading");
    const token = getToken();
    const formData = new FormData();
    loadingElement.style.display = "flex";
    // Lấy giá trị từ form
    const documentFile = document.getElementById("documentFile").files[0];
    const documentAvatar = document.getElementById("documentAvatar").value;
    // const documentAvatar ="sachToan.jpg"
    // Kiểm tra file bắt buộc
    if (!documentFile) {
        console.error("Vui lòng chọn file tài liệu");
        return;
    }

    // Lấy phần mở rộng của file
    const docType = documentFile.name.substring(documentFile.name.lastIndexOf('.') + 1);

    // Thêm tất cả dữ liệu form
    formData.append('file', documentFile);
    formData.append('docName', document.getElementById("documentTitle").value);
    formData.append('docType', docType);
    formData.append('description', document.getElementById("documentDescription").value);
    formData.append('docCategoryId', document.getElementById("groupSelect").value);
    formData.append('point', document.getElementById("pointSelect").value);
    if (documentAvatar) {
        formData.append('avatar', documentAvatar);
    }

    // Gọi API
    fetch('http://localhost:8088/doc/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
            // Không đặt Content-Type - để trình duyệt tự đặt với boundary
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi HTTP! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.code === 9999) {
                throw new Error(data.message);
            }
            loadingElement.style.display = "none";
            console.log("Upload thành công:", data);
            window.location .reload();
            // Xử lý thành công - có thể hiển thị thông báo thành công hoặc chuyển hướng
        })
        .catch(error => {
            console.error("Upload thất bại:", error.message);
            // Xử lý lỗi - hiển thị thông báo lỗi cho người dùng
        });
}

window.upDocument = upDocument;
