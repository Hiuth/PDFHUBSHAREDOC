import {getToken} from "../Share/localStorageService.js";

export function downloadDocument() {
    // Prevent any default navigation
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    const loadingElement = document.getElementById("loading2");
    loadingElement.style.display = "flex";
    const id =document.getElementById('documentIdforDownload').value;
    client.debug = function (str) {};
    console.log(id);
    client.connect({Authorization: `Bearer ${token}`},function(frame){
        client.send(`/app/downloadFile/${id}`,{},JSON.stringify(id));
        client.subscribe('/topic/downFile', function (message) {
            loadingElement.style.display = "none";
            window.location.reload();
        })

    })
}
window.downloadDocument=downloadDocument;