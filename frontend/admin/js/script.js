// Login handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('username', document.getElementById('username').value);
        formData.append('password', document.getElementById('password').value);

        try {
            console.log('Sending login request...');
            const response = await fetch('/movie_review/backend/api/admin/login.php', {
                method: 'POST',
                body: formData
            });
            console.log('Response received:', response);
            const data = await response.json();
            console.log('Parsed data:', data);
            
            const messageDiv = document.getElementById('message');
            messageDiv.style.display = 'block';
            
            if (data.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Login successful!';
                window.location.href = 'dashboard.html';
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = data.message;
            }
        } catch (error) {
            console.error('Login error:', error);
            const messageDiv = document.getElementById('message');
            messageDiv.style.display = 'block';
            messageDiv.className = 'message error';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });
}