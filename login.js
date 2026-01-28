document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        // Hardcoded credentials for this project
        // Username: admin, Password: admin123
        if (user === 'admin' && pass === 'admin123') {
            // Successful Login
            window.location.href = 'admin.html';
        } else {
            // Failed Login
            errorMsg.style.display = 'block';
            loginForm.reset();
        }
    });
});