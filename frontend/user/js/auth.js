function switchTab(type) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update forms
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(type + 'Form').classList.add('active');
}

// Handle Registration
document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('username', document.getElementById('regUsername').value);
    formData.append('email', document.getElementById('regEmail').value);
    formData.append('password', document.getElementById('regPassword').value);

    try {
        const response = await fetch('/movie_review/backend/api/user/register.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        const messageDiv = document.getElementById('registerMessage');
        messageDiv.style.display = 'block';
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
            document.getElementById('registerFormElement').reset();
            setTimeout(() => switchTab('login'), 1500);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message;
        }
    } catch (error) {
        const messageDiv = document.getElementById('registerMessage');
        messageDiv.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
});

 
// Handle Login
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('username', document.getElementById('loginUsername').value);
    formData.append('password', document.getElementById('loginPassword').value);

    try {
        const response = await fetch('/movie_review/backend/api/user/login.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.style.display = 'block';
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Login successful!';
            // Store username in localStorage
            localStorage.setItem('username', data.username);
            // Redirect to movies page
            window.location.href = '/movie_review/frontend/user/pages/movies.html';
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message;
        }
    } catch (error) {
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
});
