<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$db = "tapandgo_db";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

  $input = json_decode(file_get_contents("php://input"), true);
$studentId = (int)($input['student_id'] ?? 0);

    if ($studentId <= 0) {
        throw new Exception("Invalid student ID");
    }

    $stmt = $pdo->prepare("
        SELECT 
            b.id AS booking_id,
            b.booking_day,
            b.status,
            bs.bus_number,
            bs.route_name,
            bs.driver_name,
            bs.driver_phone,
            bs.booked_seats,
            bs.capacity
        FROM bookings b
        JOIN buses bs ON b.bus_id = bs.id
        WHERE b.student_id = :student_id
        ORDER BY b.created_at DESC
    ");

    $stmt->execute(['student_id' => $studentId]);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "bookings" => $bookings
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}