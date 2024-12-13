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

if(isset($_POST['id'])) {
    $movie->id = $_POST['id'];
    $movie->title = $_POST['title'];
    $movie->description = $_POST['description'] ?? '';
    $movie->release_date = $_POST['release_date'];
    $movie->genre = $_POST['genre'];
    $movie->director = $_POST['director'] ?? '';
    $movie->cast = $_POST['cast'] ?? '';
    $movie->duration = $_POST['duration'] ?? null;

    // Handle new poster upload
    if(isset($_FILES['poster']) && $_FILES['poster']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "../../../uploads/posters/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        
        $file_extension = pathinfo($_FILES["poster"]["name"], PATHINFO_EXTENSION);
        $file_name = uniqid() . "." . $file_extension;
        $target_file = $target_dir . $file_name;

        if(move_uploaded_file($_FILES["poster"]["tmp_name"], $target_file)) {
            // Delete old poster if exists
            if(!empty($movie->getCurrentPoster())) {
                $old_file = $target_dir . $movie->getCurrentPoster();
                if(file_exists($old_file)) {
                    unlink($old_file);
                }
            }
            $movie->poster_url = $file_name;
        }
    }

    if($movie->update()) {
        echo json_encode([
            "success" => true,
            "message" => "Movie was updated successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Unable to update movie."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing movie ID."
    ]);
}
?>