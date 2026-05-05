import type { Firestore } from 'firebase-admin/firestore'
import type { LeadEntity, LeadRepository } from './types'

function toLead(id: string, data: Record<string, unknown>): LeadEntity {
  const createdAtRaw = data.createdAt as { toDate?: () => Date } | Date | undefined
  const createdAt = createdAtRaw && typeof (createdAtRaw as { toDate?: () => Date }).toDate === 'function'
    ? (createdAtRaw as { toDate: () => Date }).toDate()
    : (createdAtRaw as Date | null | undefined) ?? null

  return {
    id,
    tenantId: String(data.tenantId ?? ''),
    createdAt,
    ...data,
  }
}

export class FirestoreLeadRepository implements LeadRepository {
  constructor(private readonly db: Firestore) {}

  async findByTenant(tenantId: string, options?: { since?: Date }): Promise<LeadEntity[]> {
    let query = this.db.collection('leads').where('tenantId', '==', tenantId).orderBy('createdAt', 'desc') as FirebaseFirestore.Query
    if (options?.since) {
      query = query.where('createdAt', '>', options.since)
    }
    const snap = await query.get()
    return snap.docs.map((doc) => toLead(doc.id, doc.data()))
  }
}
