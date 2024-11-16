import { setToken } from "../Share/localStorageService.js";

// Prevent form default submission
document.getElementById("login").addEventListener("submit", function(e) {
    e.preventDefault();
    login();
});

function login() {
    // Get input values
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;

    // Validate inputs
    if (!email || !password) {
        document.querySelector('.error').textContent = "Vui lòng điền đầy đủ thông tin";
        return;
    }

    const account = {
        email: email,
        password: password
    };

    // Connect to WebSocket
    const socket = new SockJS("http://localhost:8088/ws");
    const client = Stomp.over(socket);

    client.connect({}, function(frame) {
        // Disable debug messages
        client.debug = function(str) {};

        // Send login request
        client.send("/app/getToken", {}, JSON.stringify(account));

        // Subscribe to receive token
        client.subscribe('/topic/token', function(data) {
            try {
                const response = JSON.parse(data.body);

                if (response.code && response.code !== 1000) {
                    document.querySelector('.error').textContent = response.message || "Đăng nhập thất bại";
                    return;
                }

                const webToken = response.result;
                setToken(webToken.token);

                // Handle "Remember me" checkbox
                const rememberMe = document.getElementById("rememberme").checked;
                if (rememberMe) {
                    localStorage.setItem("rememberLogin", "true");
                }

                // Redirect to user dashboard
                window.location.href = "../../templates/User/index.html";
            } catch (error) {
                document.querySelector('.error').textContent = "Có lỗi xảy ra. Vui lòng thử lại.";
                console.error("Login error:", error);
            }
        });
    }, function(error) {
        // Connection error handling
        document.querySelector('.error').textContent = "Không thể kết nối đến server";
        console.error("STOMP error:", error);
    });
}

// Make login function globally available
window.login = login;