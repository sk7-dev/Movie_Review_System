// Function to handle logout
function logout() {
    window.location.href = '/movie_review/backend/api/admin/logout.php';
}

// Function to load all movies
async function loadMovies() {
    try {
        const response = await fetch('/movie_review/backend/api/admin/movies/list.php');
        const data = await response.json();
        
        const movieGrid = document.getElementById('movieGrid');
        
        if (data.success && data.movies.length > 0) {
            movieGrid.innerHTML = data.movies.map(movie => `
                <div class="movie-card">
                    ${movie.poster_url ? 
                        `<img src="/movie_review/backend/uploads/posters/${movie.poster_url}" 
                         alt="${movie.title}" class="movie-poster">` 
                        : '<div class="no-poster">No Poster</div>'
                    }
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-info">Release Date: ${movie.release_date}</p>
                    <p class="movie-info">Genre: ${movie.genre}</p>
                    <div class="action-buttons">
                        <button onclick="editMovie(${movie.id})" class="edit-btn">Edit</button>
                        <button onclick="deleteMovie(${movie.id})" class="delete-btn">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            movieGrid.innerHTML = '<p class="no-movies">No movies found. Add some movies!</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').innerHTML = 'Error loading movies.';
    }
}

// Function to delete a movie
async function deleteMovie(id) {
    if (confirm('Are you sure you want to delete this movie?')) {
        try {
            const response = await fetch('/movie_review/backend/api/admin/movies/delete.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            
            if (data.success) {
                // Reload the movies after successful deletion
                loadMovies();
                // Show success message
                const messageDiv = document.getElementById('message');
                messageDiv.className = 'message success';
                messageDiv.style.display = 'block';
                messageDiv.textContent = 'Movie deleted successfully!';
                // Hide message after 3 seconds
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 3000);
            } else {
                alert(data.message || 'Error deleting movie');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting movie');
        }
    }
}

// Function to navigate to edit page
function editMovie(id) {
    window.location.href = `edit-movie.html?id=${id}`;
}

// Check if user is logged in when page loads
function checkLogin() {
    fetch('/movie_review/backend/api/admin/check-auth.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            window.location.href = 'index.html';
        });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    loadMovies();
});