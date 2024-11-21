import {getToken} from "../Share/localStorageService.js";

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

    // Hàm khởi tạo biểu đồ người dùng
    function initUserChart(data) {
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
                        data: data, // Nhận dữ liệu từ API
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
    }

    // Hàm khởi tạo biểu đồ phân bố tài liệu
    function initDocumentChart({ labels, data }) {
        const docCtx = document.getElementById("documentChart").getContext("2d");
        new Chart(docCtx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data, // Nhận dữ liệu từ API
                        backgroundColor: ["#8e2de2", "#4a00e0", "#7c3aed"],
                    },
                ],
            },
            options: commonOptions,
        });
    }

    // Hàm khởi tạo biểu đồ lượt tải
    function initDownloadChart(data) {
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
                        data: data, // Nhận dữ liệu từ API
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
    }

    // Hàm lấy dữ liệu từ API
    async function fetchData(apiUrl) {
        try {
            const token = getToken(); // Lấy token từ localStorage (hoặc sessionStorage)
            if (!token) {
                throw new Error("Token không tồn tại. Vui lòng đăng nhập.");
            }

            const response = await fetch(apiUrl, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` // Thêm token vào tiêu đề
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            return null; // Trả về null nếu lỗi
        }
    }

    // Gọi API và khởi tạo biểu đồ
    async function initCharts() {
        // Dữ liệu cho biểu đồ người dùng
        const userData = await fetchData("http://localhost:8088/doc/upload/monthly");
        if (userData) {
            const monthlyUploads = Array(12).fill(0); // Mảng 12 tháng, khởi tạo giá trị 0

            // Lặp qua dữ liệu API và điền số lượng tải lên vào mảng đúng tháng
            userData.result.forEach(({ month, uploadCount }) => {
                monthlyUploads[month - 1] = uploadCount; // Gán giá trị vào đúng tháng
            });

            // Truyền dữ liệu đã xử lý cho hàm vẽ biểu đồ
            initUserChart(monthlyUploads);
        }
        // Dữ liệu cho biểu đồ phân bố tài liệu
        const docData = await fetchData("http://localhost:8088/doc/doc-type/count");
        if (docData) {
            //console.log(docData.result);
            const labels = docData.result.map(item => item.type); // ['PDF', 'Word', 'Other']
            const data = docData.result.map(item => item.count);  // [1, 11, 0]
            initDocumentChart({ labels, data }); // `documents` là dữ liệu từ API
        }

        // Dữ liệu cho biểu đồ lượt tải
        const downloadData = await fetchData("http://localhost:8088/doc/monthly-stats");
        if (downloadData) {
            const downloadCounts = Array(12).fill(0);

            // Điền giá trị từ API vào mảng
            downloadData.result.forEach(({ month, downloadCount }) => {
                downloadCounts[month - 1] = downloadCount; // `month` là từ 1-12
            });
            initDownloadChart(downloadCounts); // `downloads` là dữ liệu từ API
        }
    }

    // Gọi hàm khởi tạo tất cả biểu đồ
    initCharts();
});


document.addEventListener("DOMContentLoaded", function () {
    const accountCtx = document.getElementById("accountChart").getContext("2d");

    // Khởi tạo biểu đồ
    let accountChart = new Chart(accountCtx, {
        type: "bar",
        data: {
            labels: [],  // Labels sẽ được cập nhật từ API
            datasets: [
                {
                    label: "Tài khoản đăng ký",
                    data: [],  // Dữ liệu sẽ được cập nhật từ API
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

    // Hàm gọi API và cập nhật biểu đồ
    async function fetchAndUpdateChart(apiUrl, type) {
        const authToken = getToken(); // Thay thế bằng token của bạn (hoặc lấy từ localStorage/sessionStorage)

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authToken}`,  // Gửi token qua header
                    "Content-Type": "application/json",  // Đảm bảo Content-Type là application/json nếu cần
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json(); // Dữ liệu JSON từ API

            let labels = [];
            let chartData = [];

            if (type === "day") {
                // Dữ liệu theo ngày trong tuần
                labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
                chartData = data.result; // Mảng kết quả từ API
            } else if (type === "week") {
                // Xử lý dữ liệu tuần
                labels = data.result.map((item, index) => `Tuần ${index + 1}`);
                chartData = data.result.map(item => item.registrations);
            } else if (type === "month") {
                // Xử lý dữ liệu tháng
                labels = data.result.map((item, index) => `Tháng ${index + 1}`);
                chartData = data.result.map(item => item.count);
            }

            // Cập nhật biểu đồ
            accountChart.data.labels = labels;
            accountChart.data.datasets[0].data = chartData;
            accountChart.update(); // Cập nhật biểu đồ với dữ liệu mới
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Event listeners cho các nút thời gian
    document.getElementById("weekBtn").addEventListener("click", function () {
        fetchAndUpdateChart("http://localhost:8088/account/registrations/daily-in-current-week", "day");
    });

    document.getElementById("monthBtn").addEventListener("click", function () {
        fetchAndUpdateChart("http://localhost:8088/account/registrations/weekly", "week");
    });

    document.getElementById("yearBtn").addEventListener("click", function () {
        fetchAndUpdateChart("http://localhost:8088/account/registrations/monthly", "month");
    });
});



function numberOfUser(){
    const userCountElement = document.querySelector("#numberOfUser h3");
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
        client.send("/app/numberOfAccounts",{},JSON.stringify({}));
        client.subscribe('/topic/numberOfAcc',function (data) {
            const response = JSON.parse(data.body);
            const numberOfAccounts = response.result;
            userCountElement.textContent = numberOfAccounts;
        })
    })
}
document.addEventListener("DOMContentLoaded", numberOfUser);

function numberOfDocuments(){
    const userCountElement = document.querySelector("#numberOfDocuments h3");
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
        // client.debug = function (str) {};
        client.send("/app/numberOfDocuments",{},JSON.stringify({}));
        client.subscribe('/topic/numberOfDoc',function (data) {
            const response = JSON.parse(data.body);
            const numberOfDocument = response.result;
            userCountElement.textContent = numberOfDocument;
        })
    })
}
document.addEventListener("DOMContentLoaded", numberOfDocuments);



function numberOfDownloads(){
    const userCountElement = document.querySelector("#numberOfDownloads h3");
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.debug = function (str) {};
    client.connect({ Authorization: `Bearer ${token}` }, function (frame) {
        client.send("/app/numberOfDownloads",{},JSON.stringify({}));
        client.subscribe('/topic/numberOfDown',function (data) {
            const response = JSON.parse(data.body);
            const numberOfDownload = response.result;
            userCountElement.textContent = numberOfDownload;
        })
    })
}
document.addEventListener("DOMContentLoaded", numberOfDownloads);