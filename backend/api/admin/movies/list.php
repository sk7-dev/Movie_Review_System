<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../../config/database.php';
include_once '../../../models/Movie.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized access"
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$movie = new Movie($db);

$stmt = $movie->read();
$num = $stmt->rowCount();

if ($num > 0) {
    $movies_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($movies_arr, [
            "id" => $row['id'],
            "title" => $row['title'],
            "description" => $row['description'],
            "release_date" => $row['release_date'],
            "genre" => $row['genre'],
            "director" => $row['director'],
            "cast" => $row['cast'],
            "duration" => $row['duration'],
            "poster_url" => $row['poster_url']
        ]);
    }

    echo json_encode([
        "success" => true,
        "movies" => $movies_arr
    ]);
} else {
    echo json_encode([
        "success" => true,
        "movies" => []
    ]);
}
?>