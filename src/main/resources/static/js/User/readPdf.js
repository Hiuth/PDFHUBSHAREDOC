// Đảm bảo rằng PDF.js sử dụng worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

document.getElementById("openPdfButton").onclick = function() {
    var pdfUrl = "https://drive.google.com/file/d/1Ulxwwjc2uCoARnICBpjXR1YzjuEMOrdo/view?usp=sharing"; // Thay thế bằng URL file PDF của bạn

    // Tải PDF và hiển thị trên canvas
    var loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(function(pdf) {
        // Lấy trang đầu tiên của PDF
        pdf.getPage(1).then(function(page) {
            var scale = 1.5; // Tỉ lệ phóng to
            var viewport = page.getViewport({ scale: scale });
            
            // Thiết lập kích thước canvas
            var canvas = document.getElementById('pdfViewer');
            var context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Vẽ trang PDF lên canvas
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
        });
    }, function (reason) {
        console.error(reason); // In ra lỗi nếu không tải được PDF
    });
};

