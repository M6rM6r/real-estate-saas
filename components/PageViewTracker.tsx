'use client'
import { useEffect } from 'react'

interface Props {
  slug: string
  tenantId: string
}

export default function PageViewTracker({ slug, tenantId }: Props) {
  useEffect(() => {
    if (!slug || !tenantId) return
    fetch(`/api/${slug}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    }).catch(() => {})
  }, [slug, tenantId])

  return null
}
