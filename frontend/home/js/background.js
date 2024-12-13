function createSquares() {
    const background = document.querySelector('.moving-squares');
    const squareCount = 15;

    for (let i = 0; i < squareCount; i++) {
        const square = document.createElement('div');
        square.className = 'square';
        
        // Random size between 20px and 60px
        const size = Math.random() * 40 + 20;
        square.style.width = `${size}px`;
        square.style.height = `${size}px`;
        
        // Random starting position
        const startPos = Math.random() * 100;
        square.style.left = `${startPos}%`;
        
        // Random animation duration between 10s and 20s
        const duration = Math.random() * 10 + 10;
        square.style.animationDuration = `${duration}s`;
        
        // Random delay
        const delay = Math.random() * 10;
        square.style.animationDelay = `-${delay}s`;
        
        background.appendChild(square);
    }
}

// Create squares when DOM loads
document.addEventListener('DOMContentLoaded', createSquares);

// Recreate squares periodically to ensure continuous animation
setInterval(() => {
    const background = document.querySelector('.moving-squares');
    background.innerHTML = '';
    createSquares();
}, 30000); // Recreate every 30 seconds