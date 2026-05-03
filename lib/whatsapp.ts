export function normalizeWhatsAppTarget(input?: string | null): string | null {
  if (!input) return null
  const raw = input.trim()
  if (!raw) return null

  // If full URL is provided, extract phone-like part from supported WhatsApp URLs.
  const waMeMatch = raw.match(/wa\.me\/([^/?#\s]+)/i)
  if (waMeMatch?.[1]) {
    const digits = waMeMatch[1].replace(/\D/g, '')
    return digits.length >= 8 ? digits : null
  }

  const sendMatch = raw.match(/(?:api\.)?whatsapp\.com\/send\?([^\s#]+)/i)
  if (sendMatch?.[1]) {
    try {
      const params = new URLSearchParams(sendMatch[1])
      const phone = params.get('phone') ?? ''
      const digits = phone.replace(/\D/g, '')
      return digits.length >= 8 ? digits : null
    } catch {
      // Fall back to generic digit extraction below.
    }
  }

  // Raw phone number input (with spaces, +, dashes, etc.)
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 8 ? digits : null
}

export function buildWhatsAppLink(input?: string | null, message?: string): string {
  const target = normalizeWhatsAppTarget(input)
  if (!target) return '#'
  if (!message) return `https://wa.me/${target}`
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`
}
