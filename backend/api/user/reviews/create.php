<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

include_once '../../../config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Please login to submit a review"
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

if (isset($_POST['movie_id']) && isset($_POST['rating']) && isset($_POST['review_text'])) {
    $movie_id = $_POST['movie_id'];
    $user_id = $_SESSION['user_id'];
    $rating = $_POST['rating'];
    $review_text = $_POST['review_text'];

    // Check if user has already reviewed this movie
    $check_query = "SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$user_id, $movie_id]);

    if ($check_stmt->rowCount() > 0) {
        echo json_encode([
            "success" => false,
            "message" => "You have already reviewed this movie"
        ]);
        exit;
    }

    // Insert new review
    $query = "INSERT INTO reviews (movie_id, user_id, rating, review_text) 
              VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($query);

    if ($stmt->execute([$movie_id, $user_id, $rating, $review_text])) {
        echo json_encode([
            "success" => true,
            "message" => "Review submitted successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error submitting review"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
}
?>