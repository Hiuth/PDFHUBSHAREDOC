import {getToken} from "../Share/localStorageService.js";
async function fetchCategory() {
    try {
        const response = await fetch('http://localhost:8088/docCategory/get-all');
        const data = await response.json();

        if (data.result) {
            // Gọi hàm để cập nhật danh mục và thiết lập sự kiện
            setupCategoryOptions(data.result);
            return data.result; // Trả về danh mục đã tải
        }
        return [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

function setupCategoryOptions(categories) {
    const folderSelect = document.getElementById("folderSelectUser");

    // Xóa tất cả các option cũ
    folderSelect.innerHTML = '<option value="" selected>Chọn danh mục</option>';

    // Thêm danh mục chính vào dropdown
    const uniqueMainCategories = [...new Set(categories.map(category => category.mainCategory))];
    uniqueMainCategories.forEach(mainCategory => {
        const option = document.createElement("option");
        option.value = mainCategory;
        option.textContent = mainCategory;
        folderSelect.appendChild(option);
    });

    // Lắng nghe sự kiện thay đổi danh mục chính
    folderSelect.addEventListener("change", function () {
        const selectedCategory = this.value;

        // Lọc ra nhóm tương ứng
        const subCategories = categories.filter(cat => cat.mainCategory === selectedCategory);
        updateGroupOptions(subCategories);
    });
}

function updateGroupOptions(subCategories) {
    const groupSelect = document.getElementById("groupSelectUser");

    // Xóa các option cũ
    groupSelect.innerHTML = '<option value="" selected>Chọn nhóm</option>';

    // Thêm các nhóm liên quan
    subCategories.forEach(sub => {
        if (sub.subCategory && sub.subCategory.trim() !== "") {
            const option = document.createElement("option");
            option.value = sub.id; // Hoặc trường ID phù hợp
            option.textContent = sub.subCategory;
            groupSelect.appendChild(option);
        }
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('docId');

    if (documentId) {
        await populateDocumentForm(documentId);
    } else {
        await fetchCategory(); // Nếu không có tài liệu, chỉ tải danh mục
    }
});

export function updateDocument() {
    const token = getToken();
    const formData = new FormData();

    // Get document ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('docId');

    // Get data from form elements
    const documentFile = document.getElementById("file").files[0] || null;
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
    let docType = null;
    if (documentFile) {
        docType = documentFile.name.substring(documentFile.name.lastIndexOf('.') + 1);
    }

    formData.append('file', documentFile);
    // Append data to FormData
    formData.append('docName', documentTitle);
    formData.append('description', documentDescription);
    formData.append('docCategoryId', docCategoryId);
    formData.append('point', point);
    formData.append('docType', docType);
    formData.append('avatar', documentAvatar);

    console.log(formData);

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
            loadingElement.style.display = "none";
            console.log("Upload thành công:", data);
            window.location.reload();
        })
        .catch(error => {
            console.error("Cập nhật thất bại:", error.message);
            loadingElement.style.display = "none";
            alert("Cập nhật thất bại! Vui lòng thử lại.");
        });
}

window.updateDocument = updateDocument;



export async function populateDocumentForm(documentId) {
    const categories = await fetchCategory(); // Đợi danh mục được tải xong

    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = null;

    client.connect({}, function onSuccess(frame) {
        console.log("WebSocket connected successfully. Fetching document details.");

        client.send(`/app/getDocById/${documentId}`, {}, JSON.stringify({ documentId }));

        client.subscribe('/topic/getDocById', function (data) {
            try {
                const response = JSON.parse(data.body);
                const documentData = response.result;

                // Điền thông tin tài liệu vào form
                document.getElementById('docstitle').value = documentData.name || '';
                document.getElementById('describe').value = documentData.description || '';
                document.getElementById('folderSelectUser').value = documentData.category?.mainCategory || '';
                updateGroupOptions(
                    categories.filter(cat => cat.mainCategory === documentData.category?.mainCategory)
                );
                document.getElementById('groupSelectUser').value = documentData.category?.id || '';
                document.getElementById('documentAvatar').value = documentData.avatar || '';
                document.getElementById('fileName').textContent = documentData.fileName || '';
                document.getElementById('fileName').textContent = "Tải lên file khác nếu bạn muốn";
                const url = documentData.url;
                const formattedLink = formatGoogleDriveLink(url);
                document.getElementById('pdfview').innerHTML = '';
                document.getElementById('pdfview').innerHTML = `<iframe src="${formattedLink}" width="100%" height="100%" class="docs-part"></iframe>`;

                console.log("Form fields populated successfully.");
            } catch (error) {
                console.error("Error processing document details:", error);
                alert("Không thể tải thông tin tài liệu. Vui lòng thử lại.");
            }
        });

        setTimeout(() => {
            client.disconnect();
        }, 20000);
    }, function onError(error) {
        console.error("WebSocket connection error:", error);
        alert("Không thể kết nối tới server. Vui lòng thử lại sau.");
    });
}

function formatGoogleDriveLink(url) {
    if (!url || typeof url !== "string") {
        console.error("Invalid URL passed to formatGoogleDriveLink:", url);
        return null;
    }

    let fileId = null;

    const regexWithD = /https:\/\/drive\.google\.com\/.*?\/d\/([^\/]+)/;
    const matchWithD = url.match(regexWithD);

    if (matchWithD) {
        fileId = matchWithD[1];
    } else {
        const regexWithId = /https:\/\/drive\.google\.com\/.*?[?&]id=([^&]+)/;
        const matchWithId = url.match(regexWithId);

        if (matchWithId) {
            fileId = matchWithId[1];
        }
    }

    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}