<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../../config/database.php';
include_once '../../../models/Movie.php';

// Make sure nothing is output before the JSON response
ob_clean(); // Add this line to clear any output buffer

if (!isset($_SESSION['admin_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized access"
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

if(isset($_GET['id'])) {
    $query = "SELECT * FROM movies WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$_GET['id']]);
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "movie" => [
                "id" => $row['id'],
                "title" => $row['title'],
                "description" => $row['description'],
                "release_date" => $row['release_date'],
                "genre" => $row['genre'],
                "director" => $row['director'],
                "cast" => $row['cast'],
                "duration" => $row['duration'],
                "poster_url" => $row['poster_url']
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Movie not found"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing movie ID"
    ]);
}
exit;
?>