<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

try {
    $stmt = $pdo->query("
        SELECT id, bus_number
        FROM buses
        ORDER BY id ASC
    ");

    $buses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "buses" => $buses
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load buses: " . $e->getMessage()
    ]);
}
?>