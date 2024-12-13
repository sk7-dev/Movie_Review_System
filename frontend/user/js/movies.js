// Check authentication at page load
async function checkAuth() {
    try {
        const response = await fetch('/movie_review/backend/api/user/check-auth.php');
        const data = await response.json();
        
        if (!data.success) {
            window.location.href = '/movie_review/frontend/user/pages/index.html';
        } else {
            document.getElementById('username').textContent = `Welcome, ${data.username}`;
            loadMovies();
        }
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/movie_review/frontend/user/pages/index.html';
    }
}

let allMovies = []; // Store all movies

// Load all movies
async function loadMovies() {
    try {
        const response = await fetch('/movie_review/backend/api/user/movies/list.php');
        const data = await response.json();
        
        if (data.success && data.movies.length > 0) {
            allMovies = data.movies;
            filterAndRenderMovies();
        } else {
            document.getElementById('movieGrid').innerHTML = '<p class="no-movies">No movies available.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('movieGrid').innerHTML = '<p class="error">Error loading movies. Please try again later.</p>';
    }
}

function filterAndRenderMovies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedGenre = document.getElementById('genreFilter').value;
    const sortOption = document.getElementById('sortBy').value;

    // Filter movies
    let filteredMovies = allMovies.filter(movie => {
        const matchesSearch = 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.director.toLowerCase().includes(searchTerm) ||
            (movie.description && movie.description.toLowerCase().includes(searchTerm));
        
        const matchesGenre = !selectedGenre || movie.genre === selectedGenre;
        
        return matchesSearch && matchesGenre;
    });

    // Sort movies
    filteredMovies.sort((a, b) => {
        switch(sortOption) {
            case 'latest':
                return new Date(b.release_date) - new Date(a.release_date);
            case 'rating':
                const aRating = calculateAverageRating(a.reviews);
                const bRating = calculateAverageRating(b.reviews);
                return bRating - aRating;
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    renderMovies(filteredMovies);
}

function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
}

function renderMovies(movies) {
    const movieGrid = document.getElementById('movieGrid');
    
    if (movies.length === 0) {
        movieGrid.innerHTML = '<p class="no-movies">No movies found matching your search.</p>';
        return;
    }
    
    movieGrid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <div class="movie-header" onclick="toggleMovieDetails(${movie.id}, event)">
               
                    <div class="movie-poster-container">
                        ${movie.poster_url ? 
                            `<img src="/movie_review/backend/uploads/posters/${movie.poster_url}" 
                            alt="${movie.title}" class="movie-poster">` : 
                            '<div class="no-poster">No Poster</div>'
                        }
                    </div>
                
                <div class="movie-right">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-details-row">
                                <div class="movie-detail-item">
                                    <span class="detail-label">Release Date:</span> ${movie.release_date}
                                </div>
                                <div class="movie-detail-item">
                                    <span class="detail-label">Director:</span> ${movie.director || 'Not specified'}
                                </div>
                                <div class="movie-detail-item">
                                    <span class="detail-label">Duration:</span> ${movie.duration} min
                                </div>
                    </div>
                    <p class="movie-description">${movie.description || 'No description available.'}</p>
                    <button onclick="event.stopPropagation(); openReviewModal(${movie.id})" class="review-btn">
                        Write Review
                    </button>
                </div>
                <div class="expand-toggle">
                    <i class="fas fa-chevron-down" id="toggle-icon-${movie.id}"></i>
                </div>
            </div>
            <div class="movie-details" id="movie-details-${movie.id}" style="display: none;">
                <div class="reviews-section">
                    ${renderReviews(movie.reviews)}
                </div>
            </div>
        </div>
    `).join('');
}

function renderReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        return '<p>No reviews yet. Be the first to review!</p>';
    }
    
    return reviews.map(review => `
        <div class="review" data-review-id="${review.id}">
            <div class="review-container">
                <div class="vote-buttons">
                    <button onclick="event.stopPropagation(); handleReaction(${review.id}, 'like')" 
                            class="vote-btn upvote ${review.user_reaction === 'like' ? 'active' : ''}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="vote-count">${(review.likes || 0) - (review.dislikes || 0)}</span>
                    <button onclick="event.stopPropagation(); handleReaction(${review.id}, 'dislike')" 
                            class="vote-btn downvote ${review.user_reaction === 'dislike' ? 'active' : ''}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
                <div class="review-content">
                    <div class="review-header">
                        <span class="reviewer-name">${review.username}</span>
                        <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                        <span class="star-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                    </div>
                    <p class="review-text">${review.review_text}</p>
                    <div class="review-actions">
                        <button onclick="event.stopPropagation(); toggleComments(${review.id})" class="action-btn">
                            <i class="fas fa-comment-alt"></i>
                            ${review.comments ? review.comments.length : 0} Comments
                        </button>
                    </div>
                    <div class="comments-section" id="comments-${review.id}" style="display: none;">
                        ${renderComments(review.comments)}
                        <form onsubmit="event.preventDefault(); handleComment(event, ${review.id})" class="comment-form">
                            <textarea placeholder="What are your thoughts?" required></textarea>
                            <button type="submit">Comment</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderComments(comments) {
    if (!comments || comments.length === 0) return '';
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="commenter-name">${comment.username}</span>
                <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p class="comment-text">${comment.comment_text}</p>
        </div>
    `).join('');
}

// Toggle movie details
function toggleMovieDetails(movieId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const detailsSection = document.getElementById(`movie-details-${movieId}`);
    const toggleIcon = document.getElementById(`toggle-icon-${movieId}`);
    const movieCard = detailsSection.closest('.movie-card');
    
    if (detailsSection.style.display === 'none' || !detailsSection.style.display) {
        detailsSection.style.display = 'block';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
        movieCard.classList.add('expanded');
    } else {
        detailsSection.style.display = 'none';
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
        movieCard.classList.remove('expanded');
    }
}

function toggleComments(reviewId) {
    const commentsSection = document.getElementById(`comments-${reviewId}`);
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

async function handleReaction(reviewId, reactionType) {
    try {
        const response = await fetch('/movie_review/backend/api/user/reviews/react.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                review_id: reviewId,
                reaction_type: reactionType
            })
        });
        const data = await response.json();
        
        if (data.success) {
            const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
            const voteCount = (data.likes || 0) - (data.dislikes || 0);
            reviewElement.querySelector('.vote-count').textContent = voteCount;
            
            const upvoteBtn = reviewElement.querySelector('.vote-btn.upvote');
            const downvoteBtn = reviewElement.querySelector('.vote-btn.downvote');
            
            if (reactionType === 'like') {
                upvoteBtn.classList.toggle('active');
                downvoteBtn.classList.remove('active');
            } else {
                downvoteBtn.classList.toggle('active');
                upvoteBtn.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating reaction');
    }
}

async function handleComment(event, reviewId) {
    const form = event.target;
    const textarea = form.querySelector('textarea');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        showToast('Please write a comment');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('review_id', reviewId);
        formData.append('comment_text', commentText);
        
        const response = await fetch('/movie_review/backend/api/user/reviews/comment.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            const commentsSection = document.getElementById(`comments-${reviewId}`);
            const newCommentHtml = renderComments([data.comment]);
            commentsSection.insertAdjacentHTML('afterbegin', newCommentHtml);
            
            textarea.value = '';
            
            // Update comment count
            const commentBtn = document.querySelector(`[data-review-id="${reviewId}"] .action-btn`);
            const currentCount = parseInt(commentBtn.textContent.match(/\d+/)[0]);
            commentBtn.innerHTML = `<i class="fas fa-comment-alt"></i> ${currentCount + 1} Comments`;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error adding comment');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize search and filters
function initializeSearchAndFilters() {
    document.getElementById('searchInput').addEventListener('input', debounce(filterAndRenderMovies, 300));
    document.getElementById('genreFilter').addEventListener('change', filterAndRenderMovies);
    document.getElementById('sortBy').addEventListener('change', filterAndRenderMovies);
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Modal functions
function openReviewModal(movieId) {
    document.getElementById('movieId').value = movieId;
    document.getElementById('reviewModal').style.display = 'block';
    resetReviewForm();
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    resetReviewForm();
}

function resetReviewForm() {
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewMessage').style.display = 'none';
    currentRating = 0;
    document.querySelectorAll('.fa-star').forEach(star => {
        star.classList.remove('active');
    });
}

// Logout function
function logout() {
    window.location.href = '/movie_review/backend/api/user/logout.php';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeSearchAndFilters();
    
    // Star rating functionality
    document.querySelectorAll('.fa-star').forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = e.target.dataset.rating;
            currentRating = rating;
            document.querySelectorAll('.fa-star').forEach(s => {
                s.classList.remove('active');
                if (s.dataset.rating <= rating) {
                    s.classList.add('active');
                }
            });
        });
    });
    
    // Review form submission
    document.getElementById('reviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (currentRating === 0) {
            alert('Please select a rating');
            return;
        }
        
        const formData = new FormData();
        formData.append('movie_id', document.getElementById('movieId').value);
        formData.append('rating', currentRating);
        formData.append('review_text', document.getElementById('reviewText').value);

        try {
            const response = await fetch('/movie_review/backend/api/user/reviews/create.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                closeReviewModal();
                loadMovies();
                showToast('Review submitted successfully!');
            } else {
                document.getElementById('reviewMessage').textContent = data.message;
                document.getElementById('reviewMessage').style.display = 'block';
                document.getElementById('reviewMessage').className = 'message error';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('reviewMessage').textContent = 'Error submitting review';
            document.getElementById('reviewMessage').style.display = 'block';
            document.getElementById('reviewMessage').className = 'message error';
        }
    });
});