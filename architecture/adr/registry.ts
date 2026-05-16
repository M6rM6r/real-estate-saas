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
    id: 'ADR-003',
    title: 'Lazy loading for heavy components to improve performance',
    status: 'accepted',
    owners: ['platform'],
    date: '2026-05-12',
    context: 'PropertyDetailModal is a heavy component used in multiple themes, impacting initial bundle size.',
    decision: 'Implement React.lazy for PropertyDetailModal and wrap with Suspense in theme components.',
    consequences: [
      'Reduced initial bundle size and faster page loads.',
      'Modal loads on demand when user interacts with listings.',
      'Added loading fallback for better UX.',
    ],
  },
]
