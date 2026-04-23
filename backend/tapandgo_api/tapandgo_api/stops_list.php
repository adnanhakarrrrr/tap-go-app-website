<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

try {
    $stmt = $pdo->query("
        SELECT id, name, latitude, longitude
        FROM stops
        ORDER BY id DESC
    ");

    echo json_encode([
        "success" => true,
        "stops" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load stops: " . $e->getMessage()
    ]);
}
?>