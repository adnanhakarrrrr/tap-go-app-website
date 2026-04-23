<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

try {
    $stmt = $pdo->query("
        SELECT driver_id, full_name, phone, license_number
        FROM driver
        ORDER BY driver_id DESC
    ");

    $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "drivers" => $drivers
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load drivers: " . $e->getMessage()
    ]);
}
?>