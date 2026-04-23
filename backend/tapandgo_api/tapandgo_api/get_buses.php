<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$db   = "tapandgo_db";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $day = trim($_GET['day'] ?? 'Today');
    $area = trim($_GET['area'] ?? '');

    $sql = "
        SELECT 
            b.id,
            b.bus_number,
            b.driver_name,
            b.driver_phone,
            b.capacity,
            b.booked_seats,
            b.is_active,
            b.route_name,
            b.current_latitude,
            b.current_longitude
        FROM buses b
        WHERE b.available_day = :day
          AND b.is_active = 1
    ";

    if ($area !== '') {
        $sql .= " AND EXISTS (
            SELECT 1
            FROM stops s
            WHERE s.bus_id = b.id
              AND s.name LIKE :area
        )";
    }

    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(':day', $day);
    if ($area !== '') {
        $stmt->bindValue(':area', "%$area%");
    }

    $stmt->execute();
    $busRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $buses = [];

    foreach ($busRows as $bus) {
        $stopStmt = $pdo->prepare("
            SELECT id, name, latitude, longitude
            FROM stops
            WHERE bus_id = :bus_id
            ORDER BY stop_order ASC
        ");
        $stopStmt->execute([':bus_id' => $bus['id']]);
        $stops = $stopStmt->fetchAll(PDO::FETCH_ASSOC);

        $pathStmt = $pdo->prepare("
            SELECT latitude, longitude
            FROM route_points
            WHERE bus_id = :bus_id
            ORDER BY point_order ASC
        ");
        $pathStmt->execute([':bus_id' => $bus['id']]);
        $routePath = $pathStmt->fetchAll(PDO::FETCH_ASSOC);

        $buses[] = [
            "id" => (int)$bus["id"],
            "busNumber" => $bus["bus_number"],
            "driverName" => $bus["driver_name"],
            "driverPhone" => $bus["driver_phone"],
            "bookedSeats" => (int)$bus["booked_seats"],
            "capacity" => (int)$bus["capacity"],
            "isActive" => (bool)$bus["is_active"],
            "routeName" => $bus["route_name"],
            "currentLocation" => [
                "latitude" => (float)$bus["current_latitude"],
                "longitude" => (float)$bus["current_longitude"]
            ],
            "routePath" => array_map(function($point) {
                return [
                    "latitude" => (float)$point["latitude"],
                    "longitude" => (float)$point["longitude"]
                ];
            }, $routePath),
            "stops" => array_map(function($stop) {
                return [
                    "id" => (int)$stop["id"],
                    "name" => $stop["name"],
                    "latitude" => (float)$stop["latitude"],
                    "longitude" => (float)$stop["longitude"]
                ];
            }, $stops)
        ];
    }

    echo json_encode([
        "success" => true,
        "buses" => $buses
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}