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

    $bookingId = (int)($input['booking_id'] ?? 0);
    $studentId = (int)($input['student_id'] ?? 0);

    if ($bookingId <= 0 || $studentId <= 0) {
        throw new Exception("Missing data");
    }

    // Get booking
    $stmt = $pdo->prepare("
        SELECT bus_id, status 
        FROM bookings 
        WHERE id = :id AND student_id = :student_id
    ");
    $stmt->execute([
        'id' => $bookingId,
        'student_id' => $studentId
    ]);

    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        throw new Exception("Booking not found");
    }

    if ($booking['status'] === 'Cancelled') {
        throw new Exception("Already cancelled");
    }

    // Cancel booking
    $stmt = $pdo->prepare("
        UPDATE bookings 
        SET status = 'Cancelled' 
        WHERE id = :id
    ");
    $stmt->execute(['id' => $bookingId]);

    // Decrease booked seats
    $stmt = $pdo->prepare("
        UPDATE buses 
        SET booked_seats = booked_seats - 1 
        WHERE id = :bus_id AND booked_seats > 0
    ");
    $stmt->execute(['bus_id' => $booking['bus_id']]);

    echo json_encode([
        "success" => true,
        "message" => "Booking cancelled"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}