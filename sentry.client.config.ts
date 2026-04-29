import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Capture 10% of transactions in production for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Capture 100% of replays for sessions with errors
  replaysOnErrorSampleRate: 1.0,
  // Capture 1% of all sessions
  replaysSessionSampleRate: 0.01,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
  // Only enable in production — avoids noise during local dev
  enabled: process.env.NODE_ENV === 'production',
});
