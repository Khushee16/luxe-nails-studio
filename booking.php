<?php
// Luxe Nails Studio — booking backend (plain dependency-free PHP).
// Runs on any PHP host (e.g. cheap shared hosting). Does NOT run on
// GitHub Pages or other static hosts — the frontend handles that case
// by showing a clearly-labelled demo state instead of faking a submission.
header('Content-Type: application/json');

$services = [
  'Classic Manicure', 'Gel Manicure', 'Luxury Spa Pedicure',
  'Acrylic Full Set', 'Nail Art & Design', 'Bridal Package'
];

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) $data = $_POST;

function fail($msg) { http_response_code(422); echo json_encode(['ok' => false, 'error' => $msg]); exit; }

$service = trim($data['service'] ?? '');
$date    = trim($data['date'] ?? '');
$time    = trim($data['time'] ?? '');
$name    = trim($data['name'] ?? '');
$phone   = trim($data['phone'] ?? '');

if (!in_array($service, $services, true)) fail('Please choose a valid service.');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || strtotime($date) < strtotime('today')) fail('Please choose a valid future date.');
if (!preg_match('/^(0[9-9]|1[0-9]):(00|30)$/', $time)) fail('Please choose a valid time slot (09:00–19:30, on the hour or half hour).');
if (strlen($name) < 2) fail('Please enter your name.');
if (!preg_match('/^\+?[0-9\s\-()]{7,20}$/', $phone)) fail('Please enter a valid phone number.');

$booking = [
  'reference'  => 'LX-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)),
  'service'    => $service,
  'date'       => $date,
  'time'       => $time,
  'name'       => $name,
  'phone'      => $phone,
  'created_at' => date('c'),
];

$dir  = __DIR__ . '/data';
$file = $dir . '/bookings.json';
if (!is_dir($dir)) mkdir($dir, 0755, true);
$list = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
if (!is_array($list)) $list = [];
$list[] = $booking;
file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT), LOCK_EX);

echo json_encode([
  'ok'        => true,
  'reference' => $booking['reference'],
  'message'   => "Thank you, {$name}! Your {$service} is booked for {$date} at {$time}. We will call {$phone} to confirm.",
]);
