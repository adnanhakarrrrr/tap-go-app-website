<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

try {
    $stmt = $pdo->query("
        SELECT student_id, full_name, email, phone, credit_balance, card_id
        FROM student
        ORDER BY student_id DESC
    ");

    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "students" => $students
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load students: " . $e->getMessage()
    ]);
}
?>