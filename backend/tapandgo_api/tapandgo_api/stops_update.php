<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data["id"] ?? 0);
$name = trim($data["name"] ?? "");
$latitude = trim($data["latitude"] ?? "");
$longitude = trim($data["longitude"] ?? "");

if ($id <= 0 || $name === "" || $latitude === "" || $longitude === "") {
    echo json_encode([
        "success" => false,
        "message" => "Stop name and map location are required."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE stops
        SET name = ?, latitude = ?, longitude = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $latitude, $longitude, $id]);

    echo json_encode(["success" => true, "message" => "Stop updated successfully."]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update stop: " . $e->getMessage()
    ]);
}
?>