import {getToken} from "../Share/localStorageService.js";

export function downloadDocument() {
    // Prevent any default navigation
    const token = getToken();
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    const id =document.getElementById('documentIdforDownload').value;
    client.debug = function (str) {};
    console.log(id);
    client.connect({Authorization: `Bearer ${token}`},function(frame){
        client.send(`/app/downloadFile/${id}`,{},JSON.stringify(id));
        client.subscribe('/topic/downFile', function (message) {

        })

    })
}
window.downloadDocument=downloadDocument;