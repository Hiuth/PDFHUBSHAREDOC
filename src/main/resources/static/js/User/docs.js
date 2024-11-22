function updateActiveTab(currentTab) {
    const allDocCateLinks = document.querySelectorAll('.docCate');

    allDocCateLinks.forEach(link => {
        const linkTab = new URLSearchParams(new URL(link.href).search).get('tab');
        if (linkTab === currentTab) {
            link.classList.add('active');
            updateThumbnailTitle(link.textContent);
        } else {
            link.classList.remove('active');
        }
    });
}

function updateThumbnailTitle(text) {
    const thumbnailTitle = document.querySelector('.thumnail-title');
    if (thumbnailTitle) {
        thumbnailTitle.textContent = text;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('category.html')) {
        const allDocCateLinks = document.querySelectorAll('.docCate');
        allDocCateLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const newTab = new URLSearchParams(new URL(this.href).search).get('tab');
                const newUrl = `category.html?tab=${encodeURIComponent(newTab)}`;
                history.pushState({}, '', newUrl);
                updateActiveTab(newTab);
            });
        });
    }
});

function openReportPopup() {
    document.getElementById('report-popup').style.display = '';
    document.getElementById('overlay').style.display = '';
}

// Function to close popup
function closeReportPopup() {
    document.getElementById('report-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function submitReportPopup(event) {
    let isValid = true;

    // Kiểm tra lỗi cho từng trường input
    const option = document.getElementById("violation-type").value.trim();
    if (option == "") {
        document.querySelectorAll(".error")[0].textContent = "Vui lòng chọn loại vi phạm";
        isValid = false;
    } else {
        document.querySelectorAll(".error")[0].textContent = "";
    }

    if (isValid) {
        return true;
    }
    return false;
}


function fetchDocument(subCategory, i = 0) {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {}; // Tắt debug

        client.send(`/app/DocumentsBySubCategory/${subCategory}`, {}, JSON.stringify({ subCategory }));

        client.subscribe('/topic/getDocumentsBySubCategory', function (data) {
            const response = JSON.parse(data.body);
            const documents = response.result;
            const docsGroup = document.querySelectorAll('.Docs-group')[i];
            if (!docsGroup) {
                console.error("Docs-group element not found");
                return;
            }
            if (Array.isArray(documents) && documents.length > 0) {
                docsGroup.innerHTML = ''; // Xóa nội dung cũ
                documents.forEach((doc) => {
                    const documentLink = document.createElement('a');
                    documentLink.href = `docsDetail.html?docId=${doc.id}`;
                    documentLink.classList.add('Docs');
                    const imageUrl = `../../static/images/Documents/${doc.avatar}`;

                    documentLink.innerHTML = `
                        <div class="docs-content">
                            <img src="${imageUrl}" alt="">
                            <div class="docTitle">${doc.name}</div>
                        </div>
                        <div class="docInfor">
                            <div class="uptime">
                                <img src="../../static/images/icons/Clock.png" alt="">
                                <div>${formatDate(doc.createdAt)}</div>
                            </div>
                            <div class="downtime">
                                <img src="../../static/images/icons/Downloading Updates.png" alt="">
                                <div>${doc.downloadTimes}</div>
                            </div>
                            <div class="price">
                                <img src="../../static/images/icons/icons8-coin-32.png" alt="">
                                <div>${doc.point}</div>
                            </div>
                        </div>
                    `;
                    docsGroup.appendChild(documentLink);
                });
            }
        });
    }, function (error) {
        console.error("Connection error: ", error);
    });
}


function fetchAllSubCategories() {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    client.connect({}, function (frame) {
        // Tắt debug để tránh log không cần thiết
        client.debug = function (str) {};

        // Lấy tab hiện tại từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentTab = urlParams.get('tab');

        // Gửi yêu cầu để lấy danh sách subcategory
        client.send("/app/allCategories", {}, JSON.stringify({}));

        // Lắng nghe phản hồi từ server trên topic
        client.subscribe('/topic/getAllCategory', function (data) {
            const response = JSON.parse(data.body);
            const categories = response.result; // Danh sách các `DocCategory`

            if (Array.isArray(categories)) {
                const docCategories = document.querySelector('.docCategories');
                // Lọc và sắp xếp các subcategory không rỗng
                const filteredCategories = categories.filter(category => category.subCategory !== null);
                filteredCategories.sort((a, b) => {
                    if (a.subCategory && b.subCategory) {
                        return a.subCategory.localeCompare(b.subCategory);
                    } else if (a.subCategory) {
                        return -1;
                    } else {
                        return 1;
                    }
                });

                // Tạo thẻ `<a>` cho từng `subCategory`
                filteredCategories.forEach((category) => {
                    const categoryLink = document.createElement('a');
                    categoryLink.classList.add('docCate');
                    categoryLink.href = `category.html?tab=${encodeURIComponent(category.subCategory || '')}`;
                    categoryLink.textContent = category.subCategory || 'Uncategorized';

                    // Thêm thẻ `<a>` vào phần tử `.docCategories`
                    docCategories.appendChild(categoryLink);
                });

                // Gọi hàm updateActiveTab để cập nhật lại class 'active'
                if (window.location.pathname.endsWith('category.html')) {
                    updateActiveTab(currentTab);
                }
            } else {
                console.error("Expected an array but received:", categories);
            }
        });
    }, function (error) {
        console.error("Connection error:", error);
    });
}

function fetchAllCategory() {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    client.connect({}, function (frame) {
        client.debug = function (str) {}; // Tắt debug log

        // Gửi yêu cầu để lấy danh sách category
        client.send("/app/allCategories", {}, JSON.stringify({}));

        // Lắng nghe phản hồi từ server trên topic
        client.subscribe('/topic/getAllCategory', function (data) {
            const response = JSON.parse(data.body);
            const categories = response.result; // Danh sách các `DocCategory`
            console.log(categories);
            if (Array.isArray(categories)) {
                const cateContainer = document.querySelector('.cate-box');
                cateContainer.innerHTML = ''; // Xóa nội dung cũ nếu có

                // Nhóm các `subCategories` theo `mainCategory`
                const groupedCategories = categories.reduce((acc, category) => {
                    const mainCategory = category.mainCategory || 'Uncategorized';
                    if (!acc[mainCategory]) {
                        acc[mainCategory] = [];
                    }
                    if (category.subCategory) {
                        acc[mainCategory].push(category.subCategory);
                    }
                    return acc;
                }, {});

                // Tạo các phần tử HTML theo mainCategory
                for (const [mainCategory, subCategories] of Object.entries(groupedCategories)) {
                    // Sắp xếp subCategories theo bảng chữ cái
                    subCategories.sort(compareStringsWithNumbers);

                    // Tạo tiêu đề cho `mainCategory`
                    const cateTitle = document.createElement('div');
                    cateTitle.classList.add('cateTitle');
                    cateTitle.textContent = mainCategory;

                    // Tạo đường gạch ngang
                    const hr = document.createElement('hr');

                    // Tạo container chứa các subCategories
                    const oneCate = document.createElement('div');
                    oneCate.classList.add('oneCate');

                    // Duyệt qua từng subCategory đã sắp xếp và tạo thẻ `<a>`
                    subCategories.forEach((subCategory) => {
                        const subCategoryLink = document.createElement('a');
                        subCategoryLink.classList.add('oneType');
                        subCategoryLink.href = `category.html?tab=${encodeURIComponent(subCategory)}`;
                        subCategoryLink.textContent = subCategory || 'Uncategorized';
                        oneCate.appendChild(subCategoryLink);
                    });

                    // Thêm các phần tử vào container chính
                    cateContainer.appendChild(cateTitle);
                    cateContainer.appendChild(hr);
                    cateContainer.appendChild(oneCate);
                }
            } else {
                console.error("Expected an array but received:", categories);
            }
        });
    }, function (error) {
        console.error("Connection error:", error);
    });
}

function compareStringsWithNumbers(a, b) {
    const regex = /(\d+|\D+)/g; // Tách thành các phần chữ và số
    const partsA = a.match(regex);
    const partsB = b.match(regex);

    for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
        const partA = partsA[i];
        const partB = partsB[i];

        // Kiểm tra nếu phần hiện tại là số
        const isNumberA = !isNaN(partA);
        const isNumberB = !isNaN(partB);

        if (isNumberA && isNumberB) {
            // So sánh như số
            const diff = parseInt(partA) - parseInt(partB);
            if (diff !== 0) return diff;
        } else {
            // So sánh như chuỗi
            const diff = partA.localeCompare(partB);
            if (diff !== 0) return diff;
        }
    }

    // Trường hợp có độ dài khác nhau, phần dài hơn sẽ đứng sau
    return partsA.length - partsB.length;
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


function fetchDetailsDocument(documentId) {
    // Configure WebSocket connection
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = null; // Disable debug logs

    // Establish connection
    client.connect({},
        function onSuccess(frame) {
            console.log("WebSocket connected successfully. Fetching document details.");

            // Send request to fetch document details
            client.send(`/app/getDocById/${documentId}`, {}, JSON.stringify({ documentId }));

            // Subscribe to document details response
            const detailsSubscription = client.subscribe('/topic/getDocById', function(data) {
                try {
                    const response = JSON.parse(data.body);
                    const documentData = response.result;

                    // Find document details container
                    const docDetailElement = document.querySelector('.docsInfo-part');
                    if (!docDetailElement) {
                        console.error("Document detail container not found");
                        return;
                    }

                    // Handle document data rendering
                    renderDocumentDetails(docDetailElement, documentData, documentId);

                    // Unsubscribe after receiving data
                    detailsSubscription.unsubscribe();
                } catch (error) {
                    console.error("Error processing document details:", error);
                    displayErrorMessage("Không thể tải chi tiết tài liệu");
                }
            });

            // Send request to fetch comments
            client.send(`/app/comments/${documentId}`, {}, JSON.stringify({}));

            // Subscribe to comments
            const commentsSubscription = client.subscribe('/topic/getComments', function(data) {
                try {
                    const response = JSON.parse(data.body);
                    const allComments = response.result || [];
                    const commentCount = Array.isArray(allComments) ? allComments.length : 0;

                    const commentCountElement = document.getElementById('numComment');
                    if (commentCountElement) {
                        commentCountElement.textContent = commentCount;
                    }

                    commentsSubscription.unsubscribe();
                } catch (error) {
                    console.error("Error processing comments:", error);
                }
            });

            // Disconnect after a short timeout
            setTimeout(() => {
                client.disconnect();
            }, 5000);
        },
        function onError(error) {
            console.error("WebSocket connection error:", error);
            displayErrorMessage("Không thể kết nối. Vui lòng thử lại.");
        }
    );
}

// Helper function to render document details
function renderDocumentDetails(containerElement, documentData, documentID) {
    // Safely extract and format data
    console.log(documentData);
    const username = getUsername(documentData);
    const formattedDate = documentData.createdAt
        ? formatDate(documentData.createdAt)
        : 'Ngày không xác định';
    const category = getCategory(documentData);
    const description = documentData.description || 'Không có mô tả';
    const downloadTimes = documentData.downloadTimes || 0;
    const documentName = documentData.name || 'Tài liệu không có tiêu đề';
    //alert(documentData.url);

    const url = documentData.url;
    const formattedLink = formatGoogleDriveLink(url);


    // Render document details HTML
    containerElement.innerHTML = `
        <div class="Info-part">
            <div class="DocTitle">
                ${documentData.name || 'Tài liệu không có tiêu đề'}
            </div>
            <div class="UserAndCategory">
                <div class="form-group2 admin">
                    <img src="../../static/images/icons/avatar.png" alt="Avatar">
                    <div class="gray" id="userName">${username}</div>
                    <div class="role">Tác giả</div>
                </div>
                <div class="form-group2 Category">
                    <div class="gray">Thể loại</div>
                    <a>${category}</a>
                </div>
            </div>
            <div class="caption">
                ${description}
            </div>
            <div class="moreInfo">
                <div class="form-group2">
                    <img src="../../static/images/icons/Clock.png" alt="Clock">
                    <div class="pink" id="uptime">${formattedDate}</div>
                </div>
                <div class="num">
                    <div class="form-group2">
                        <img src="../../static/images/icons/QuotePink.png" alt="Comments">
                        <div class="pink"><div id="numComment">0</div> bình luận</div>
                    </div>
                    <div class="form-group2">
                        <img src="../../static/images/icons/Downloading Updates.png" alt="Downloads">
                        <div class="pink"><div id="numDownLoads">${downloadTimes}</div> lượt tải</div>
                    </div>
                </div>
            </div>
            <div class="download-part">
                <div class="download-p">
                    <div class="form-group2">
                        <a onclick="openReportPopup()" id="report-btn">Báo cáo vi phạm</a>
                        <a onclick="" id="share">Chia sẻ</a>
                    </div>
                    <button class="download-button" onclick="downloadDocument(${documentID})">
                    <img src="../../static/images/icons/Downloading Updates White.png" alt="">Tải xuống bản đầy đủ</button>
                </div>
            </div>
            <iframe id="pdfview" src="${formattedLink}" class="docs-part"></iframe>
        </div>
    `;
}

function downloadDocument(docId) {
    // Prevent any default navigation
    event.preventDefault();

    fetch(`http://localhost:8088/doc/download/${docId}`, {
        method: 'GET',
    })
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            throw new Error("Tải xuống thất bại!");
        })
        .then(blob => {
            // Tạo URL cho blob
            const url = window.URL.createObjectURL(blob);

            // Tạo link tải file
            const link = document.createElement('a');
            link.href = url;
            link.download = `Document-${docId}.pdf`;

            // Thêm link vào DOM, click, và xóa
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Giải phóng URL blob
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error("Lỗi khi tải xuống:", error);
            alert("Không thể tải xuống tài liệu.");
        });
}


// Utility function to get username safely
function getUsername(documentData) {
    return documentData?.accountName
        || documentData?.createdBy?.name
        || documentData?.createdBy
        || 'Tác giả không xác định';
}

// Utility function to format date safely
function formatDate(dateString) {
    if (!dateString) return 'Ngày không xác định';

    try {
        // Nếu không có dateString, trả về giá trị mặc định
        if (!dateString) return 'Ngày không xác định';

        const date = new Date(dateString);
        return isNaN(date)
            ? 'Ngày không hợp lệ'
            : date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
    } catch (error) {
        console.error("Date formatting error:", error);
        return 'Ngày không hợp lệ';
    }
}

// Utility function to get category safely
function getCategory(documentData) {
    return documentData?.category?.mainCategory
        || documentData?.category
        || 'Chưa phân loại';
}

// Error display utility
function displayErrorMessage(message) {
    const docDetailElement = document.querySelector('.docsInfo-part');
    if (docDetailElement) {
        docDetailElement.innerHTML = `
            <div class="Info-part">
                <div class="DocTitle text-danger">Lỗi</div>
                <div class="caption text-muted">${message}</div>
            </div>
        `;
    }
}

function searchDocument(Key, i = 0) {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {}; // Tắt debug

        client.send(`/app/findDoc/${Key}`, {}, JSON.stringify({Key}));

        client.subscribe('/topic/findDocument', function (data) {
            const response = JSON.parse(data.body);
            const documents = response.result;
            const docsGroup = document.querySelectorAll('.Docs-group')[i];
            if (!docsGroup) {
                console.error("Docs-group element not found");
                return;
            }

            if (Array.isArray(documents) && documents.length > 0) {
                docsGroup.innerHTML = ''; // Xóa nội dung cũ
                documents.forEach((doc) => {
                    const documentLink = document.createElement('a');
                    documentLink.href = `docsDetail.html?docId=${doc.id}`;
                    documentLink.classList.add('Docs');
                    const imageUrl = `../../static/images/Documents/${doc.avatar}`;

                    documentLink.innerHTML = `
                        <div class="docs-content">
                        <img src="${imageUrl}" alt="">
                        <div class="docTitle">${doc.name}</div>
                        </div>
                        <div class="docInfor">
                            <div class="uptime">
                                <img src="../../static/images/icons/Clock.png" alt="">
                                <div>${formatDate(doc.createdAt)}</div>
                            </div>
                            <div class="downtime">
                                <img src="../../static/images/icons/Downloading Updates.png" alt="">
                                <div>${doc.downloadTimes}</div>
                            </div>
                            <div class="price">
                                <img src="../../static/images/icons/icons8-coin-32.png" alt="">
                                <div>${doc.point}</div>
                            </div>
                        </div>
                    `;
                    docsGroup.appendChild(documentLink);
                });
            }
        });
    }, function (error) {
        console.error("Connection error: ", error);
    });
}

