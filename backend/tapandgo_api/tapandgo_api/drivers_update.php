<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$driver_id = intval($data["driver_id"] ?? 0);
$full_name = trim($data["full_name"] ?? "");
$phone = trim($data["phone"] ?? "");
$license_number = trim($data["license_number"] ?? "");

if ($driver_id <= 0 || $full_name === "" || $license_number === "") {
    echo json_encode([
        "success" => false,
        "message" => "Full name and license number are required."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE driver
        SET full_name = ?, phone = ?, license_number = ?
        WHERE driver_id = ?
    ");
    $stmt->execute([
        $full_name,
        $phone !== "" ? $phone : null,
        $license_number,
        $driver_id
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Driver updated successfully."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update driver: " . $e->getMessage()
    ]);
}
?>