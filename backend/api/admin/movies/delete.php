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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    $movie->id = $data->id;
    
    if($movie->delete()) {
        echo json_encode([
            "success" => true,
            "message" => "Movie was deleted."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Unable to delete movie."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing movie ID."
    ]);
}
?>