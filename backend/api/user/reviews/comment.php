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

if (isset($_POST['review_id']) && isset($_POST['comment_text'])) {
    try {
        $query = "INSERT INTO review_comments (review_id, user_id, comment_text) 
                 VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        
        $stmt->execute([
            $_POST['review_id'],
            $_SESSION['user_id'],
            $_POST['comment_text']
        ]);
        
        // Get the new comment with user info
        $query = "SELECT rc.*, u.username 
                 FROM review_comments rc
                 JOIN users u ON rc.user_id = u.id 
                 WHERE rc.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$db->lastInsertId()]);
        $comment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "comment" => $comment,
            "message" => "Comment added successfully"
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error adding comment: " . $e->getMessage()
        ]);
    }
}
?>