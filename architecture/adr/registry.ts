export type AdrStatus = 'proposed' | 'accepted' | 'superseded' | 'deprecated'

export type ArchitectureDecisionRecord = {
  id: string
  title: string
  status: AdrStatus
  owners: string[]
  date: string
  context: string
  decision: string
  consequences: string[]
  supersedes?: string[]
}

export const ADR_REGISTRY: ArchitectureDecisionRecord[] = [
  {
    id: 'ADR-001',
    title: 'Firestore remains primary online store with repository adapters',
    status: 'accepted',
    owners: ['platform'],
    date: '2026-05-05',
    context: 'The project has existing Firestore-first runtime with partial Supabase artifacts.',
    decision: 'Introduce repository adapters to isolate data access and allow phased backend evolution.',
    consequences: [
      'Route handlers depend on repository interfaces instead of raw collection access.',
      'Backend migration to alternative providers can be done incrementally.',
    ],
  },
  {
    id: 'ADR-002',
    title: 'Observability contract with request-id and structured route logs',
    status: 'accepted',
    owners: ['platform'],
    date: '2026-05-05',
    context: 'Operational debugging required consistent traceability and sanitization.',
    decision: 'Every key route emits route start/end/error logs and propagates x-request-id.',
    consequences: [
      'Improved incident triage with latency buckets and redacted payloads.',
      'Clients can correlate API failures via x-request-id headers.',
    ],
  },
]
