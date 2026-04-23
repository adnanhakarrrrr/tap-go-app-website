<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = "localhost";
$db   = "tapandgo_db";
$user = "root";
$pass = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $studentId = (int)($_GET['student_id'] ?? 0);

    if ($studentId <= 0) {
        throw new Exception("Missing or invalid student_id.");
    }

    $stmt = $pdo->prepare("
        SELECT id, type, title, amount, description, created_at
        FROM transactions
        WHERE student_id = :student_id
        ORDER BY created_at DESC, id DESC
    ");
    $stmt->execute([':student_id' => $studentId]);

    $transactions = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "transactions" => $transactions
    ]);

} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}