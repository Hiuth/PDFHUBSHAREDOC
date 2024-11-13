document.addEventListener('DOMContentLoaded', function() {
    // Lấy tất cả docCate links
    const allDocCateLinks = document.querySelectorAll('.docCate');
    // Lọc ra các link category (không bao gồm Đề xuất)
    const docCateLinks = Array.from(allDocCateLinks).filter(link => 
        link.getAttribute('href').includes('category.html')
    );
    
    const thumbnailTitle = document.querySelector('.thumnail-title');
    
    // Lấy tab từ URL khi trang được load
    const urlParams = new URLSearchParams(window.location.search);
    const currentTab = urlParams.get('tab');

    // Cập nhật thumbnail title
    function updateThumbnailTitle(text) {
        if (thumbnailTitle) {
            thumbnailTitle.textContent = text;
        }
    }

    // Cập nhật active class dựa vào tab trong URL
    function updateActiveTab() {
        docCateLinks.forEach(link => {
            const linkTab = new URLSearchParams(new URL(link.href).search).get('tab');
            if (currentTab === linkTab) {
                link.classList.add('active');
                updateThumbnailTitle(link.textContent);
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Thêm sự kiện click cho từng link category
    docCateLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Xóa class active của tất cả các link
            allDocCateLinks.forEach(l => l.classList.remove('active'));
            
            // Thêm class active cho link được click
            this.classList.add('active');
            
            // Cập nhật thumbnail title
            updateThumbnailTitle(this.textContent);
            
            // Cập nhật URL với tab mới
            const newTab = new URLSearchParams(new URL(this.href).search).get('tab');
            const newUrl = `category.html?tab=${encodeURIComponent(newTab)}`;
            history.pushState({}, '', newUrl);
        });
    });

    // Cập nhật active tab khi trang được load
    updateActiveTab();
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



function fetchDocument(subCategory,i) {
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
       // console.log("Connected: " + frame);
        client.debug = function (str) {};
       // console.log("hello");
        client.send(`/app/DocumentsBySubCategory/${subCategory}`, {}, JSON.stringify({ subCategory }));

        client.subscribe('/topic/getDocumentsByCategory', function (data) {
            const response = JSON.parse(data.body);
            const documents = response.result;

            if (Array.isArray(documents)) {
                    const docsGroup = document.querySelectorAll('.Docs-group')[i];
                if (!docsGroup) {
                    console.error("Docs-group element not found");
                    return;
                }

                 docsGroup.innerHTML = ''; // Clear old content

                documents.forEach((doc) => { // Use documents instead of documentDataArray
                    const documentLink = document.createElement('a');
                    documentLink.href = `docsDetail.html?docId=${doc.id}`;
                    documentLink.classList.add('Docs');
                    const imageUrl = `../../static/images/${doc.avatar}`;
                    //const imageUrl=`https://drive.google.com/uc?export=view&id=1QVGA73Ph2VO2P4U1MI2Or6_2qF4huImt`
                  //  console.log(`${doc.avatar}`);
                    documentLink.innerHTML = `
                        <img src="${imageUrl}" alt="ảnh gg">
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
                console.error("Expected an array but received:", documents);
            }
        });
    },function (error) {
        console.error("Connection error: ", error);
    });
}


// Gọi hàm khi trang được tải