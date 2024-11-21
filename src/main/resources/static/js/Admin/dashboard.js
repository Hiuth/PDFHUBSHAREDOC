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