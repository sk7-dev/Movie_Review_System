<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

include_once '../../../config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Please login first"
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (isset($data->review_id) && isset($data->reaction_type)) {
    try {
        // Check if user already reacted
        $check_query = "SELECT id, reaction_type FROM review_reactions 
                       WHERE review_id = ? AND user_id = ?";
        $stmt = $db->prepare($check_query);
        $stmt->execute([$data->review_id, $_SESSION['user_id']]);
        
        if ($stmt->rowCount() > 0) {
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($existing['reaction_type'] === $data->reaction_type) {
                // Remove reaction if same type
                $query = "DELETE FROM review_reactions 
                         WHERE review_id = ? AND user_id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([$data->review_id, $_SESSION['user_id']]);
            } else {
                // Update reaction type
                $query = "UPDATE review_reactions 
                         SET reaction_type = ? 
                         WHERE review_id = ? AND user_id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([$data->reaction_type, $data->review_id, $_SESSION['user_id']]);
            }
        } else {
            // Insert new reaction
            $query = "INSERT INTO review_reactions (review_id, user_id, reaction_type) 
                     VALUES (?, ?, ?)";
            $stmt = $db->prepare($query);
            $stmt->execute([$data->review_id, $_SESSION['user_id'], $data->reaction_type]);
        }
        
        // Get updated counts
        $counts_query = "SELECT 
                            SUM(reaction_type = 'like') as likes,
                            SUM(reaction_type = 'dislike') as dislikes
                        FROM review_reactions 
                        WHERE review_id = ?";
        $counts_stmt = $db->prepare($counts_query);
        $counts_stmt->execute([$data->review_id]);
        $counts = $counts_stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "likes" => (int)$counts['likes'] ?: 0,
            "dislikes" => (int)$counts['dislikes'] ?: 0,
            "message" => "Reaction updated successfully"
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error processing reaction"
        ]);
    }
}
?>