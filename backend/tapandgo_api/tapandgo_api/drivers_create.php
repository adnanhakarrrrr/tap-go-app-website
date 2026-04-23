<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim($data["full_name"] ?? "");
$phone = trim($data["phone"] ?? "");
$license_number = trim($data["license_number"] ?? "");

if ($full_name === "" || $license_number === "") {
    echo json_encode([
        "success" => false,
        "message" => "Full name and license number are required."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO driver (full_name, phone, license_number)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([
        $full_name,
        $phone !== "" ? $phone : null,
        $license_number
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Driver created successfully."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create driver: " . $e->getMessage()
    ]);
}
?>