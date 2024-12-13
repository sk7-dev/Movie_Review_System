let movieId = null;

// Get movie ID from URL
const urlParams = new URLSearchParams(window.location.search);
movieId = urlParams.get('id');

if (!movieId) {
    window.location.href = 'dashboard.html';
}

// Load movie data
async function loadMovieData() {
    try {
        const response = await fetch(`/movie_review/backend/api/admin/movies/get.php?id=${movieId}`);
        const data = await response.json();
        
        if (data.success) {
            const movie = data.movie;
            document.getElementById('movieId').value = movie.id;
            document.getElementById('title').value = movie.title;
            document.getElementById('description').value = movie.description || '';
            document.getElementById('release_date').value = movie.release_date;
            document.getElementById('genre').value = movie.genre;
            document.getElementById('director').value = movie.director || '';
            document.getElementById('cast').value = movie.cast || '';
            document.getElementById('duration').value = movie.duration || '';
            
            if (movie.poster_url) {
                document.getElementById('currentPoster').innerHTML = `
                    <img src="/movie_review/backend/uploads/posters/${movie.poster_url}" 
                         alt="Current poster" 
                         style="max-width: 200px; margin: 10px 0;">
                `;
            }
        } else {
            alert('Error loading movie data');
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading movie data');
        window.location.href = 'dashboard.html';
    }
}

// Handle form submission
document.getElementById('editMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    formData.append('id', movieId);

    try {
        const response = await fetch('/movie_review/backend/api/admin/movies/update.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'block';
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Movie updated successfully!';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'Failed to update movie';
        }
    } catch (error) {
        console.error('Error:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
});

// Load movie data when page loads
document.addEventListener('DOMContentLoaded', loadMovieData);