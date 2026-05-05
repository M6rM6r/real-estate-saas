<?php

declare(strict_types=1);

use Rew\WebhookGateway\QueueStore;
use Rew\WebhookGateway\Signature;

require_once __DIR__ . '/../src/Signature.php';
require_once __DIR__ . '/../src/QueueStore.php';

$queueDir = __DIR__ . '/../storage/queue';
$deadLetterDir = __DIR__ . '/../storage/dead-letter';
@mkdir($queueDir, 0777, true);
@mkdir($deadLetterDir, 0777, true);

$store = new QueueStore($queueDir, $deadLetterDir);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

function send_json(int $status, array $body): never {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($path === '/health' && $method === 'GET') {
    send_json(200, [
        'status' => 'ok',
        'service' => 'php-webhooks-gateway',
        'ts' => gmdate('c'),
    ]);
}

if ($path === '/webhooks/partner' && $method === 'POST') {
    $raw = file_get_contents('php://input') ?: '';
    $signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? null;
    $partner = $_SERVER['HTTP_X_PARTNER'] ?? 'unknown';
    $secret = getenv('PARTNER_WEBHOOK_SECRET') ?: '';

    if (!Signature::isValid($raw, $signature, $secret)) {
        send_json(401, ['error' => 'Invalid signature']);
    }

    $payload = json_decode($raw, true);
    if (!is_array($payload)) {
        send_json(400, ['error' => 'Invalid JSON payload']);
    }

    $eventId = $store->enqueue([
        'partner' => $partner,
        'payload' => $payload,
    ]);

    send_json(202, ['accepted' => true, 'event_id' => $eventId]);
}

if ($path === '/dispatch' && $method === 'POST') {
    $target = getenv('MAIN_APP_WEBHOOK_TARGET') ?: 'http://host.docker.internal:3000/api/integrations/webhooks';
    $maxAttempts = (int)(getenv('MAX_DISPATCH_ATTEMPTS') ?: 5);

    $processed = 0;
    foreach ($store->pending() as $event) {
        $processed++;
        $attempts = (int)($event['attempts'] ?? 0) + 1;

        $ch = curl_init($target);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode([
                'partner' => $event['partner'] ?? 'unknown',
                'payload' => $event['payload'] ?? [],
                'gateway_event_id' => $event['id'] ?? null,
                'attempt' => $attempts,
            ], JSON_THROW_ON_ERROR),
            CURLOPT_TIMEOUT => 8,
        ]);

        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            $store->ack((string)$event['_file']);
            continue;
        }

        $event['attempts'] = $attempts;
        if ($attempts >= $maxAttempts) {
            $store->ack((string)$event['_file']);
            $store->deadLetter($event, $curlError !== '' ? $curlError : ('http_status_' . $httpCode));
            continue;
        }

        $store->ack((string)$event['_file']);
        $store->enqueue($event);
    }

    send_json(200, ['processed' => $processed]);
}

send_json(404, ['error' => 'Not found']);
