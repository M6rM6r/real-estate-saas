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

export async function logMutation(params: {
  tenantId: string
  action: 'create' | 'update' | 'delete' | 'publish'
  resource: 'listing' | 'news' | 'announcement' | 'profile' | 'gallery' | 'team' | 'lead'
  resourceId: string
  userId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}) {
  try {
    await adminDb.collection('audit_logs').add({
      tenant_id: params.tenantId,
      action: params.action,
      resource: params.resource,
      resource_id: params.resourceId,
      user_id: params.userId,
      before: params.before ?? null,
      after: params.after ?? null,
      created_at: new Date(),
    })
  } catch {
    // Never let audit failures break the main operation
  }
}
