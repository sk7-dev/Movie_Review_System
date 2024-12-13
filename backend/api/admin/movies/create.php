<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

if (
    isset($_POST['title']) &&
    isset($_POST['release_date']) &&
    isset($_POST['genre'])
) {
    // Handle file upload
    $poster_url = null;
    if (isset($_FILES['poster']) && $_FILES['poster']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "../../../uploads/posters/";
        $file_extension = pathinfo($_FILES["poster"]["name"], PATHINFO_EXTENSION);
        $file_name = uniqid() . "." . $file_extension;
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($_FILES["poster"]["tmp_name"], $target_file)) {
            $poster_url = $file_name;
        }
    }

    // Set movie properties
    $movie->title = $_POST['title'];
    $movie->description = $_POST['description'] ?? '';
    $movie->release_date = $_POST['release_date'];
    $movie->genre = $_POST['genre'];
    $movie->director = $_POST['director'] ?? '';
    $movie->cast = $_POST['cast'] ?? '';
    $movie->duration = $_POST['duration'] ?? null;
    $movie->poster_url = $poster_url;
    $movie->admin_id = $_SESSION['admin_id'];

    if ($movie->create()) {
        echo json_encode([
            "success" => true,
            "message" => "Movie was created successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Unable to create movie."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing required data"
    ]);
}
?>