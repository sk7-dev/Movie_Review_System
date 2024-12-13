<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

include_once '../../../config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Please login to view movies"
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    // Simple query to get all movies
    $query = "SELECT * FROM movies ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $movies = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Get reviews for this movie
        $review_query = "SELECT r.*, u.username 
                        FROM reviews r 
                        JOIN users u ON r.user_id = u.id 
                        WHERE r.movie_id = ?";
        $review_stmt = $db->prepare($review_query);
        $review_stmt->execute([$row['id']]);
        $reviews = $review_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $row['reviews'] = $reviews;
        $movies[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "movies" => $movies
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error loading movies: " . $e->getMessage()
    ]);
}
?>