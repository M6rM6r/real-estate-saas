<?php

declare(strict_types=1);

namespace Rew\WebhookGateway;

final class Signature
{
    public static function isValid(string $payload, ?string $signature, string $secret): bool
    {
        if ($signature === null || $secret === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }
}
