import {getToken} from "../Share/localStorageService.js";

async function fetchCategory() {
    try {
        const response = await fetch('http://localhost:8088/docCategory/get-all'); // Đảm bảo URL chính xác
        const data = await response.json();

        if (data.result) {
            CategoryOptions(data.result);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

// Hàm để thêm các danh mục vào documentCategory
function CategoryOptions(categories) {
    const categorySelect = document.getElementById("folderSelectUser");

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
        GroupOptions(subCategories);
    });
}

// Hàm để thêm các nhóm vào documentGroup
function GroupOptions(subCategories) {
    const groupSelect = document.getElementById("groupSelectUser");

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
document.addEventListener("DOMContentLoaded", fetchCategory);

export function uploadDocument() {
    const token = getToken();
    const formData = new FormData();

    // Lấy dữ liệu từ các phần tử trong form
    const documentFile = document.getElementById("file").files[0];
    const documentTitle = document.getElementById("docstitle").value.trim();
    const documentDescription = document.getElementById("describe").value.trim();
    const docCategoryId = document.getElementById("groupSelectUser").value;
    const point = document.querySelector('select[name="pay"]').value;
    const documentAvatar = document.getElementById("documentAvatar").value;
    // Kiểm tra file tài liệu bắt buộc
    if (!documentFile) {
        alert("Vui lòng chọn tệp tài liệu!");
        return;
    }
    const loadingElement = document.getElementById("loading2");
    loadingElement.style.display = "flex";
    // Lấy phần mở rộng của file tài liệu
    const docType = documentFile.name.substring(documentFile.name.lastIndexOf('.') + 1);

    // Kiểm tra các trường dữ liệu khác
    if (!documentTitle || !docCategoryId) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Thêm dữ liệu vào FormData
    formData.append('file', documentFile);
    formData.append('docName', documentTitle);
    formData.append('docType', docType);
    formData.append('description', documentDescription);
    formData.append('docCategoryId', docCategoryId);
    formData.append('point', point);
    if (documentAvatar) {
        formData.append('avatar', documentAvatar);
    }
    console.log("Nội dung FormData:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }
    // Gọi API
    fetch('http://localhost:8088/doc/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
            // Không đặt Content-Type khi sử dụng FormData
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
            //alert("Đăng tải thành công!");
           window.location.reload();
        })
        .catch(error => {
            console.error("Upload thất bại:", error.message);
            alert("Đăng tải thất bại! Vui lòng thử lại.");
        });
}
window.uploadDocument=uploadDocument;


