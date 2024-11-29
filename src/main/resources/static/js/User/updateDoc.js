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
export function updateDocument() {
    const token = getToken();
    const formData = new FormData();

    // Get document ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('docId');

    // Get data from form elements
    const documentFile = document.getElementById("file").files[0];
    const documentTitle = document.getElementById("docstitle").value.trim();
    const documentDescription = document.getElementById("describe").value.trim();
    const docCategoryId = document.getElementById("groupSelectUser").value;
    const point = document.querySelector('select[name="pay"]').value;
    const documentAvatar = document.getElementById("documentAvatar").value;

    // Validate required fields
    if (!docId) {
        alert("Không tìm thấy ID tài liệu!");
        return;
    }
    const loadingElement = document.getElementById("loading2");
    loadingElement.style.display = "flex";

    // Optional file upload check
    const docType = documentFile
        ? documentFile.name.substring(documentFile.name.lastIndexOf('.') + 1)
        : null;
    // Append data to FormData
    if (documentFile) {
        formData.append('file', documentFile);
    }
    formData.append('docName', documentTitle);
    formData.append('description', documentDescription);
    formData.append('docCategoryId', docCategoryId);
    formData.append('point', point);

    if (docType) {
        formData.append('docType', docType);
    }
    formData.append('avatar', documentAvatar);

    // API Call
    fetch(`http://localhost:8088/doc/update/${docId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
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
            // if (data.code === 9999) {
            //     throw new Error(data.message);
            // }
            loadingElement.style.display = "none";
            console.log("Upload thành công:", data);
            //alert("Đăng tải thành công!");
            window.location.reload();
        })
        .catch(error => {
            console.error("Cập nhật thất bại:", error.message);
            loadingElement.style.display = "none";
            alert("Cập nhật thất bại! Vui lòng thử lại.");
        });
}

window.updateDocument = updateDocument;