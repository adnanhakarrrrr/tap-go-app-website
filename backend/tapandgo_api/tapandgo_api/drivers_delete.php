<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$driver_id = intval($data["driver_id"] ?? 0);

if ($driver_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid driver ID."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM driver WHERE driver_id = ?");
    $stmt->execute([$driver_id]);

    echo json_encode([
        "success" => true,
        "message" => "Driver deleted successfully."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete driver: " . $e->getMessage()
    ]);
}
?>