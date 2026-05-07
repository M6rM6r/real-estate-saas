/**
 * Lead scoring engine.
 *
 * Produces a deterministic 0-100 score based on observable lead signals.
 * No external calls — fully synchronous, safe to run in any runtime.
 *
 * Score bands:
 *   80-100  🔥 Hot    — Act within 1 hour
 *   55-79   🌡 Warm   — Follow up same day
 *   30-54   ❄ Cold   — Add to nurture sequence
 *   0-29    💤 Low    — Archive after 7 days if no response
 */

export type LeadScoreInput = {
  name: string
  phone: string
  email?: string | null
  message?: string | null
  listingId?: string | null
  /** ISO timestamp of submission */
  createdAt?: string | Date
}

export type LeadScoreResult = {
  score: number
  band: 'hot' | 'warm' | 'cold' | 'low'
  signals: Record<string, number>
  reasoning: string[]
}

// ── Scoring weights ────────────────────────────────────────────────────────────

const WEIGHTS = {
  /** Has a listing attachment — shows transactional intent */
  hasListingId: 20,
  /** Email provided — willing to be contacted multiple ways */
  hasEmail: 10,
  /** Message length ≥ 30 chars — thoughtful, not noise */
  meaningfulMessage: 15,
  /** Message length ≥ 80 chars — detailed, high intent */
  detailedMessage: 10,
  /** Contains price-signal keywords (numbers, "budget", "price", "cost", etc.) */
  priceMention: 15,
  /** Contains urgency keywords ("now", "today", "urgent", "asap", "soon") */
  urgencyKeywords: 10,
  /** Contains contact-request keywords ("call", "contact", "reach", "whatsapp") */
  contactRequest: 8,
  /** Phone has international prefix (+) — foreign/HNW buyer signal */
  internationalPhone: 7,
  /** Submitted during business hours (08:00-20:00 GST = UTC+3) */
  businessHours: 5,
} as const

// ── Helpers ────────────────────────────────────────────────────────────────────

const PRICE_RE = /\b(price|cost|budget|سعر|ميزانية|تكلفة|\d{4,})\b/i
const URGENCY_RE = /\b(urgent|asap|now|today|الآن|عاجل|اليوم|قريبا|soon)\b/i
const CONTACT_RE = /\b(call|whatsapp|contact|reach|تواصل|اتصل|واتساب)\b/i
const INTL_PHONE_RE = /^\+\d/

function isBusinessHoursGST(date: Date): boolean {
  // GST = UTC+3
  const gstHour = (date.getUTCHours() + 3) % 24
  return gstHour >= 8 && gstHour < 20
}

function scoreBand(score: number): LeadScoreResult['band'] {
  if (score >= 80) return 'hot'
  if (score >= 55) return 'warm'
  if (score >= 30) return 'cold'
  return 'low'
}

// ── Main scoring function ──────────────────────────────────────────────────────

export function scoreLead(input: LeadScoreInput): LeadScoreResult {
  const signals: Record<string, number> = {}
  const reasoning: string[] = []

  const msg = (input.message ?? '').trim()
  const createdAt = input.createdAt
    ? input.createdAt instanceof Date
      ? input.createdAt
      : new Date(input.createdAt)
    : new Date()

  if (input.listingId) {
    signals.hasListingId = WEIGHTS.hasListingId
    reasoning.push('Attached to a specific listing (+20)')
  }

  if (input.email) {
    signals.hasEmail = WEIGHTS.hasEmail
    reasoning.push('Provided email (+10)')
  }

  if (msg.length >= 30) {
    signals.meaningfulMessage = WEIGHTS.meaningfulMessage
    reasoning.push('Message ≥30 chars (+15)')
  }

  if (msg.length >= 80) {
    signals.detailedMessage = WEIGHTS.detailedMessage
    reasoning.push('Message ≥80 chars (+10)')
  }

  if (PRICE_RE.test(msg)) {
    signals.priceMention = WEIGHTS.priceMention
    reasoning.push('Mentions price/budget (+15)')
  }

  if (URGENCY_RE.test(msg)) {
    signals.urgencyKeywords = WEIGHTS.urgencyKeywords
    reasoning.push('Urgency keyword detected (+10)')
  }

  if (CONTACT_RE.test(msg)) {
    signals.contactRequest = WEIGHTS.contactRequest
    reasoning.push('Contact request keyword (+8)')
  }

  if (INTL_PHONE_RE.test(input.phone.trim())) {
    signals.internationalPhone = WEIGHTS.internationalPhone
    reasoning.push('International phone number (+7)')
  }

  if (isBusinessHoursGST(createdAt)) {
    signals.businessHours = WEIGHTS.businessHours
    reasoning.push('Submitted during business hours (+5)')
  }

  const score = Math.min(
    100,
    Object.values(signals).reduce((sum, v) => sum + v, 0),
  )

  return {
    score,
    band: scoreBand(score),
    signals,
    reasoning,
  }
}
