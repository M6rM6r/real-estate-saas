export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request)
  if (limited) return limited

  const { title, price, location, bedrooms, bathrooms, area } = await request.json()

  const prompt = `You are a professional real estate copywriter. Write a compelling property listing in both English and Arabic.

Property details:
- Title: ${title}
- Price: AED ${price}
- Location: ${location}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Area: ${area} sqm

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{"english":"<2-3 paragraph English description>","arabic":"<2-3 paragraph Arabic description>"}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    const parsed = JSON.parse(raw) as { english: string; arabic: string }
    return NextResponse.json(parsed)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}