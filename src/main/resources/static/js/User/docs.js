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

            docsGroup.innerHTML = ''; // Xóa nội dung cũ

            if (Array.isArray(documents) && documents.length > 0) {
                documents.forEach((doc) => {
                    const documentLink = document.createElement('a');
                    documentLink.href = `docsDetail.html?docId=${doc.id}`;
                    documentLink.classList.add('Docs');
                    const imageUrl = `../../static/images/${doc.avatar}`;

                    documentLink.innerHTML = `
                        <img src="${imageUrl}" alt="">
                        <div class="docTitle">${doc.name}</div>
                        <div class="docInfor">
                            <div class="uptime">
                                <img src="../../static/images/icons/Clock.png" alt="">
                                <div>${doc.createAt}</div>
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
            } else {
                // Hiển thị thông báo nếu không có kết quả nào phù hợp
                const noResultsDiv = document.createElement('div');
                noResultsDiv.classList.add('no-results');
                noResultsDiv.innerHTML = `
                <img src="../../static/images/icons/Box-Important.png">
                <div>Không tìm thấy tài liệu phù hợp</div>`
                docsGroup.appendChild(noResultsDiv);
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

function fetchDetailsDocument() {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    client.connect({}, function (frame) {
        client.debug = function (str) {}; // Disable debug logging

        // Get docId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const docId = urlParams.get('docId');

        if (!docId) {
            console.error("No document ID found in URL parameters");
            return;
        }

        // Send request to get document details
        client.send(`/app/getDocById/${docId}`, {}, JSON.stringify({ docId }));

        // Subscribe to receive document details
        client.subscribe('/topic/getDocById', function (data) {
            try {
                const response = JSON.parse(data.body);
                const documentData = response.result;
                const docDetailElement = document.querySelector('.docsInfo-part');

                if (!docDetailElement) {
                    console.error("docsInfo-part element not found");
                    return;
                }

                if (!documentData) {
                    console.error("No document data received");
                    return;
                }

                const formattedDate = formatDateTime(documentData.createdAt);

                // Update document info section with null checks
                docDetailElement.innerHTML = `
                    <div class="Info-part">
                        <div class="DocTitle">
                            ${documentData.name || 'Untitled Document'}
                        </div>
                        <div class="UserAndCategory">
                            <div class="form-group2 admin">
                                <img src="../../static/images/icons/avatar.png" alt="Avatar">
                                <div class="gray" id="userName">${documentData.createdBy?.fullName || 'Unknown Author'}</div>
                                <div class="role">Tác giả</div>
                            </div>
                            <div class="form-group2 Category">
                                <div class="gray">Thể loại</div>
                                <a>${documentData.category?.name || 'Uncategorized'}</a>
                            </div>
                        </div>
                        <div class="caption">
                            ${documentData.description || 'No description available'}
                        </div>
                        <div class="moreInfo">
                            <div class="form-group2">
                                <img src="../../static/images/icons/Clock.png" alt="Clock">
                                <div class="pink" id="uptime">${formattedDate}</div>
                            </div>
                            <div class="num">
                                <div class="form-group2">
                                    <img src="../../static/images/icons/QuotePink.png" alt="Comments">
                                    <div class="pink"><div id="numComment">${documentData.commentCount || 0}</div>bình luận</div>
                                </div>
                                <div class="form-group2">
                                    <img src="../../static/images/icons/Downloading Updates.png" alt="Downloads">
                                    <div class="pink"><div id="numDownLoads">${documentData.downloadTimes || 0}</div>lượt tải</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Add download button event listener if URL exists
                if (documentData.url) {
                    const downloadBtn = document.querySelector('.download-button');
                    if (downloadBtn) {
                        downloadBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            window.location.href = documentData.url;
                        });
                    }
                }
            } catch (error) {
                console.error("Error processing document data:", error);
            }
        }, function(error) {
            console.error("Error subscribing to topic:", error);
        });
    }, function(error) {
        console.error("Error connecting to WebSocket:", error);
    });
}

// Helper function to format datetime
    function formatDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        const hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${formattedHours}${ampm} ${day}/${month}/${year}`;
    }


