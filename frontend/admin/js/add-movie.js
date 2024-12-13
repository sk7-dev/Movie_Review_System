document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch('/movie_review/backend/api/admin/movies/create.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        messageDiv.style.display = 'block';
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Movie added successfully!';
            // Reset the form
            document.getElementById('addMovieForm').reset();
            // Clear the file input
            document.getElementById('poster').value = '';
            // Optional: Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
});