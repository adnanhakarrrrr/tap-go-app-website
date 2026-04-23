<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$latitude = trim($data["latitude"] ?? "");
$longitude = trim($data["longitude"] ?? "");

if ($name === "" || $latitude === "" || $longitude === "") {
    echo json_encode([
        "success" => false,
        "message" => "Stop name and map location are required."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO stops (name, latitude, longitude)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$name, $latitude, $longitude]);

    echo json_encode(["success" => true, "message" => "Stop created successfully."]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create stop: " . $e->getMessage()
    ]);
}
?>