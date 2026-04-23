<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = intval($data["id"] ?? 0);

if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid stop ID."]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM stops WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true, "message" => "Stop deleted successfully."]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete stop: " . $e->getMessage()
    ]);
}
?>