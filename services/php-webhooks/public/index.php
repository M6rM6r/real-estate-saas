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
    $target        = getenv('MAIN_APP_WEBHOOK_TARGET') ?: 'http://host.docker.internal:3000/api/integrations/webhooks';
    $maxAttempts   = (int)(getenv('MAX_DISPATCH_ATTEMPTS') ?: 5);
    $gatewaySecret = (string)(getenv('GATEWAY_DISPATCH_SECRET') ?: '');

    /** Structured log helper — emits JSON lines for log aggregators (Loki, CloudWatch, etc.) */
    $log = static function (string $level, string $message, array $context = []): void {
        $line = array_merge([
            'ts'      => gmdate('c'),
            'level'   => $level,
            'service' => 'php-webhook-gateway',
            'message' => $message,
        ], $context);
        // phpcs:ignore WordPress.PHP.DevelopmentFunctions
        fwrite(STDERR, json_encode($line, JSON_UNESCAPED_UNICODE) . "\n");
    };

    $processed = 0;
    $succeeded = 0;
    $deadLettered = 0;

    foreach ($store->pending() as $event) {
        $processed++;
        $attempts  = (int)($event['attempts'] ?? 0) + 1;
        $eventId   = (string)($event['id'] ?? 'unknown');

        // ── Exponential backoff: only re-dispatch if enough time has passed ──
        // Delay schedule (seconds): 0, 30, 120, 600, 3600
        $backoffSeconds = [0, 30, 120, 600, 3600];
        $nextRetryAt    = (int)($event['next_retry_at'] ?? 0);
        if ($attempts > 1 && time() < $nextRetryAt) {
            $log('debug', 'Skipping event — backoff not elapsed', [
                'event_id'     => $eventId,
                'attempts'     => $attempts - 1,
                'next_retry_at'=> gmdate('c', $nextRetryAt),
            ]);
            continue;
        }

        $headers = [
            'Content-Type: application/json',
        ];
        if ($gatewaySecret !== '') {
            $headers[] = 'x-gateway-secret: ' . $gatewaySecret;
        }

        $postBody = json_encode([
            'partner'          => $event['partner'] ?? 'unknown',
            'payload'          => $event['payload'] ?? [],
            'gateway_event_id' => $event['id'] ?? null,
            'attempt'          => $attempts,
        ], JSON_THROW_ON_ERROR);

        $ch = curl_init($target);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_POSTFIELDS     => $postBody,
            CURLOPT_TIMEOUT        => 8,
        ]);

        curl_exec($ch);
        $httpCode  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            $store->ack((string)$event['_file']);
            $succeeded++;
            $log('info', 'Webhook event dispatched', [
                'event_id' => $eventId,
                'attempt'  => $attempts,
                'http'     => $httpCode,
            ]);
            continue;
        }

        // Determine if we should dead-letter or re-enqueue
        $event['attempts'] = $attempts;
        $store->ack((string)$event['_file']);

        if ($attempts >= $maxAttempts) {
            $reason = $curlError !== '' ? $curlError : ('http_status_' . $httpCode);
            $store->deadLetter($event, $reason);
            $deadLettered++;
            $log('error', 'Webhook event dead-lettered', [
                'event_id' => $eventId,
                'attempts' => $attempts,
                'reason'   => $reason,
            ]);
            continue;
        }

        // Calculate next retry timestamp using exponential backoff
        $delaySecs           = $backoffSeconds[min($attempts, count($backoffSeconds) - 1)];
        $event['next_retry_at'] = time() + $delaySecs;
        $store->enqueue($event);
        $log('warn', 'Webhook event re-queued with backoff', [
            'event_id'       => $eventId,
            'attempt'        => $attempts,
            'http'           => $httpCode,
            'retry_in_secs'  => $delaySecs,
            'next_retry_at'  => gmdate('c', $event['next_retry_at']),
        ]);
    }

    send_json(200, [
        'processed'    => $processed,
        'succeeded'    => $succeeded,
        'dead_lettered'=> $deadLettered,
        'requeued'     => $processed - $succeeded - $deadLettered,
    ]);
}

send_json(404, ['error' => 'Not found']);
