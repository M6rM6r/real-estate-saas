import { adminDb } from '@/lib/firebase-admin'

export async function writeAdminLog(
  action: string,
  performedBy: string,
  options: {
    targetId?: string
    targetType?: string
    metadata?: Record<string, unknown>
  } = {}
) {
  await adminDb.collection('admin_logs').add({
    action,
    performed_by: performedBy,
    target_id: options.targetId,
    target_type: options.targetType,
    metadata: options.metadata ?? null,
    created_at: new Date(),
  })
}
