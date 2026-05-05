<?php

declare(strict_types=1);

namespace Rew\WebhookGateway;

final class QueueStore
{
    public function __construct(
        private readonly string $queueDir,
        private readonly string $deadLetterDir,
    ) {}

    public function enqueue(array $event): string
    {
        $id = $event['id'] ?? bin2hex(random_bytes(12));
        $event['id'] = $id;
        $event['attempts'] = $event['attempts'] ?? 0;
        $event['created_at'] = $event['created_at'] ?? gmdate('c');

        $path = $this->queueDir . DIRECTORY_SEPARATOR . $id . '.json';
        file_put_contents($path, json_encode($event, JSON_THROW_ON_ERROR));

        return $id;
    }

    /** @return array<int,array<string,mixed>> */
    public function pending(): array
    {
        $events = [];
        foreach (glob($this->queueDir . DIRECTORY_SEPARATOR . '*.json') ?: [] as $file) {
            $content = file_get_contents($file);
            if ($content === false) {
                continue;
            }
            $payload = json_decode($content, true);
            if (is_array($payload)) {
                $payload['_file'] = $file;
                $events[] = $payload;
            }
        }
        return $events;
    }

    public function ack(string $filePath): void
    {
        if (is_file($filePath)) {
            @unlink($filePath);
        }
    }

    public function deadLetter(array $event, string $reason): void
    {
        $event['dead_letter_reason'] = $reason;
        $event['dead_letter_at'] = gmdate('c');
        $id = $event['id'] ?? bin2hex(random_bytes(12));
        file_put_contents(
            $this->deadLetterDir . DIRECTORY_SEPARATOR . $id . '.json',
            json_encode($event, JSON_THROW_ON_ERROR),
        );
    }
}
