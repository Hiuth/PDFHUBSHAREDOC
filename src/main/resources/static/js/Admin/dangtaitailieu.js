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

function upDocument(){

}
// Gọi hàm fetch khi trang tải xong
document.addEventListener("DOMContentLoaded", fetchCategories);



