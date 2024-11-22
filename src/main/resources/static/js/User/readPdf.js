// Google Drive API Client ID
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = '2ecea7d9fee01d294ff2763da1d620ed37961ae6';
const FILE_ID = 'YOUR_FILE_ID';  // ID của file trên Google Drive

// Khởi tạo Google API Client
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    }).then(function() {
        loadFile();  // Tải file PDF khi API Client được khởi tạo
    });
}

// Xác thực người dùng và tải file PDF
function loadFile() {
    gapi.auth2.getAuthInstance().signIn().then(function() {
        gapi.client.drive.files.get({
            fileId: FILE_ID,
            alt: 'media'
        }).then(function(response) {
            const fileUrl = response.result.webContentLink;
            renderPDF(fileUrl);  // Gọi hàm renderPDF với URL
        }, function(error) {
            console.error("Error loading file: " + error);
        });
    });
}

// Render PDF trên canvas
function renderPDF(url) {
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        var pdfDoc = pdfDoc_;
        console.log("PDF loaded");

        pdfDoc.getPage(1).then(function(page) {
            var scale = 1.5;
            var viewport = page.getViewport({ scale: scale });

            var canvas = document.getElementById("pdf-canvas");
            var ctx = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({
                canvasContext: ctx,
                viewport: viewport
            });
        });
    }, function(error) {
        console.error("Error loading PDF: " + error);
    });
}

function formatGoogleDriveLink(url) {
    // Kiểm tra nếu đường dẫn là một URL hợp lệ của Google Drive
    const regex = /https:\/\/drive\.google\.com\/.*?\/d\/([^\/]+)\//;
    const match = url.match(regex);

    // Nếu không phải là đường dẫn Google Drive hợp lệ, trả về null
    if (!match) {
        return null;
    }

    // Trả về đường dẫn đã được format
    const fileId = match[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
}

// Tải Google API Client
gapi.load('client:auth2', initClient);
