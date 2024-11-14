import { setToken } from "../Share/localStorageService.js";

// function login() {
//     const email = document.getElementById("login-email").value;
//     const password = document.getElementById("login-pass").value;
//
//     const account = {
//         email: email,
//         password: password
//     };
//
//     fetch("http://localhost:8088/auth/token", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(account)
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error("Network response was not ok");
//             }
//             return response.json();
//         })
//         .then(data => {
//             // if (data.code !== 1000) {
//             //     throw new Error(data.message);
//             // }
//             console.log(data);
//             setToken(data.result?.token);
//             window.location.href = "/webchiasetailieu/src/main/resources/templates/Admin/dashboard.html"
//         })
//         .catch(error => {
//             console.error("Error during authentication:", error);
//         });
// }

function login(){
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;
    const account = {
        email: email,
        password: password
    };
    console.log(account);
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);
    client.connect({}, function (frame) {
        client.debug = function (str) {};
        client.send(`/app/getToken`, {}, JSON.stringify(account));
        client.subscribe('/topic/token', function (data) {
            // if (data.code !== 1000) {
            //     throw new Error(data.message);
            // }
            const response = JSON.parse(data.body);
            const webToken = response.result;
            console.log(webToken);
            setToken(webToken.token);
            window.location.href = "/webchiasetailieu/src/main/resources/templates/Admin/dashboard.html"
        })
    })
}
// Đảm bảo login() khả dụng toàn cục
window.login = login;
