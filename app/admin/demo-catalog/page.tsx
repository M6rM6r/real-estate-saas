'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ExternalLink,
  Copy,
  Check,
  Search,
  Layers,
  Palette,
  Building2,
  Sparkles,
  Mail,
  House,
  CheckSquare,
  Square,
  Play,
  X,
} from 'lucide-react'

type DemoTenantCard = {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended' | string
  theme: string
  business_type: string
  primary_color: string
  cover_url: string
  tagline: string
  contact_email: string
  listingCount: number
  leadCount: number
  created_at: string
}

const businessTypeLabel: Record<string, string> = {
  real_estate: 'Real Estate',
  restaurant: 'Restaurant',
  salon: 'Salon',
  retail: 'Retail',
  services: 'Services',
  other: 'Other',
}

export default function AdminDemoCatalogPage() {
  const [items, setItems] = useState<DemoTenantCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTheme, setActiveTheme] = useState<string>('all')
  const [activeBusiness, setActiveBusiness] = useState<string>('all')
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [presentMode, setPresentMode] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  useEffect(() => {
    fetch('/api/admin/demo-catalog')
      .then((r) => r.json())
      .then((data: { items?: DemoTenantCard[] }) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const themeOptions = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.theme)))], [items])
  const businessOptions = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.business_type)))], [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q) ||
        item.business_type.toLowerCase().includes(q)
      const matchesTheme = activeTheme === 'all' || item.theme === activeTheme
      const matchesBusiness = activeBusiness === 'all' || item.business_type === activeBusiness
      return matchesSearch && matchesTheme && matchesBusiness
    })
  }, [items, search, activeTheme, activeBusiness])

  const selectedItems = useMemo(() => {
    const selectedSet = new Set(selectedSlugs)
    return filtered.filter((item) => selectedSet.has(item.slug))
  }, [filtered, selectedSlugs])

  const presentationItems = selectedItems.length > 0 ? selectedItems : filtered

  const copyAllLinks = async () => {
    const text = filtered.map((i) => `https://wa9l.website/${i.slug}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1800)
  }

  const copyOne = async (slug: string) => {
    await navigator.clipboard.writeText(`https://wa9l.website/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 1600)
  }

  const toggleSelected = (slug: string) => {
    setSelectedSlugs((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])
  }

  const toggleSelectAllFiltered = () => {
    const allFilteredSlugs = filtered.map((i) => i.slug)
    const allSelected = allFilteredSlugs.length > 0 && allFilteredSlugs.every((slug) => selectedSlugs.includes(slug))
    if (allSelected) {
      setSelectedSlugs((prev) => prev.filter((slug) => !allFilteredSlugs.includes(slug)))
      return
    }
    setSelectedSlugs((prev) => Array.from(new Set([...prev, ...allFilteredSlugs])))
  }

  const openSelected = () => {
    const targets = (selectedItems.length > 0 ? selectedItems : filtered).map((i) => i.slug)
    targets.forEach((slug) => {
      window.open(`/${slug}`, '_blank', 'noopener,noreferrer')
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#00ff41]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-mono">
      {presentMode && (
        <div className="fixed inset-0 z-50 bg-[#050505] overflow-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#00ff41]">Presentation Mode</h2>
              <p className="text-[#00ff41]/45 text-sm">Showing {presentationItems.length} demo page{presentationItems.length === 1 ? '' : 's'}</p>
            </div>
            <button
              type="button"
              onClick={() => setPresentMode(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00ff41]/30 text-[#00ff41] hover:bg-[#00ff41]/10"
            >
              <X className="h-4 w-4" /> Exit
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {presentationItems.map((item) => (
              <a
                key={`present-${item.id}`}
                href={`/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-[#00ff41]/20 bg-[#0d0d0d] overflow-hidden hover:border-[#00ff41]/45 transition-colors"
              >
                <div className="relative h-60 bg-[#111]">
                  {item.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${item.primary_color}aa, #111827)` }} />
                  )}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[#00ff41] font-semibold">{item.name}</p>
                    <p className="text-[#00ff41]/45 text-xs">/{item.slug} • {businessTypeLabel[item.business_type] ?? item.business_type}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#00ff41]/80 text-sm">
                    Open <ExternalLink className="h-4 w-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#00ff41]">{'>'} Demo Catalog_</h1>
          <p className="text-[#00ff41]/45 text-sm mt-1">
            Sales-ready demo pages with direct links and visual previews
          </p>
        </div>

        <button
          type="button"
          onClick={copyAllLinks}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00ff41]/35 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 text-[#00ff41] text-sm transition-colors"
        >
          {copiedAll ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copiedAll ? 'Copied demo links' : 'Copy all demo links'}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00ff41]/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by demo name, slug, theme, or business"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0d0d0d] border border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/25 focus:outline-none focus:border-[#00ff41]/40"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#00ff41]/45 text-xs">Theme:</span>
          {themeOptions.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setActiveTheme(theme)}
              className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${
                activeTheme === theme
                  ? 'border-[#00ff41]/45 bg-[#00ff41]/15 text-[#00ff41]'
                  : 'border-[#00ff41]/20 text-[#00ff41]/60 hover:text-[#00ff41]'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#00ff41]/45 text-xs">Business:</span>
          {businessOptions.map((biz) => (
            <button
              key={biz}
              type="button"
              onClick={() => setActiveBusiness(biz)}
              className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${
                activeBusiness === biz
                  ? 'border-[#00ff41]/45 bg-[#00ff41]/15 text-[#00ff41]'
                  : 'border-[#00ff41]/20 text-[#00ff41]/60 hover:text-[#00ff41]'
              }`}
            >
              {biz === 'all' ? 'all' : (businessTypeLabel[biz] ?? biz)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00ff41]/25 text-[#00ff41]/80 hover:text-[#00ff41] hover:border-[#00ff41]/40 text-xs"
          >
            {filtered.length > 0 && filtered.every((f) => selectedSlugs.includes(f.slug))
              ? <CheckSquare className="h-3.5 w-3.5" />
              : <Square className="h-3.5 w-3.5" />}
            Select all filtered
          </button>

          <button
            type="button"
            onClick={openSelected}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00ff41]/35 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 text-[#00ff41] text-xs disabled:opacity-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open selected ({selectedItems.length || filtered.length})
          </button>

          <button
            type="button"
            onClick={() => setPresentMode(true)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00ff41]/35 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 text-[#00ff41] text-xs disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Present mode
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl p-8 text-center text-[#00ff41]/35">
          No demo tenants found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const publicUrl = `/${item.slug}`
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#00ff41]/20 bg-[#0d0d0d] overflow-hidden hover:border-[#00ff41]/35 transition-colors"
              >
                <div className="relative h-44 bg-[#111]">
                  <button
                    type="button"
                    onClick={() => toggleSelected(item.slug)}
                    className="absolute top-3 left-3 z-10 rounded-md px-2 py-1 text-[11px] bg-black/55 border border-white/20 text-white hover:bg-black/70 inline-flex items-center gap-1"
                  >
                    {selectedSlugs.includes(item.slug) ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                    Select
                  </button>
                  {item.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${item.primary_color}aa, #111827)`,
                      }}
                    />
                  )}
                  <span
                    className="absolute top-3 right-3 text-[11px] px-2 py-1 rounded-full border"
                    style={{
                      color: '#fff',
                      backgroundColor: `${item.primary_color}dd`,
                      borderColor: `${item.primary_color}`,
                    }}
                  >
                    {item.theme}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="text-[#00ff41] font-semibold text-base line-clamp-1">{item.name}</h2>
                    <p className="text-[#00ff41]/50 text-xs mt-0.5">/{item.slug}</p>
                  </div>

                  {item.tagline && <p className="text-[#00ff41]/70 text-sm line-clamp-2">{item.tagline}</p>}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-[#00ff41]/15 bg-[#00ff41]/5 px-2 py-1.5 text-[#00ff41]/75 inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {businessTypeLabel[item.business_type] ?? item.business_type}
                    </div>
                    <div className="rounded-md border border-[#00ff41]/15 bg-[#00ff41]/5 px-2 py-1.5 text-[#00ff41]/75 inline-flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      {item.listingCount} listings
                    </div>
                    <div className="rounded-md border border-[#00ff41]/15 bg-[#00ff41]/5 px-2 py-1.5 text-[#00ff41]/75 inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      {item.leadCount} leads
                    </div>
                    <div className="rounded-md border border-[#00ff41]/15 bg-[#00ff41]/5 px-2 py-1.5 text-[#00ff41]/75 inline-flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5" />
                      {item.primary_color}
                    </div>
                  </div>

                  {item.contact_email && (
                    <p className="text-[#00ff41]/45 text-xs inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {item.contact_email}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#00ff41]/35 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 text-[#00ff41] text-sm transition-colors"
                    >
                      <House className="h-4 w-4" />
                      Open demo
                    </a>
                    <button
                      type="button"
                      onClick={() => copyOne(item.slug)}
                      className="px-3 py-2 rounded-lg border border-[#00ff41]/20 text-[#00ff41]/70 hover:text-[#00ff41] hover:border-[#00ff41]/35 transition-colors"
                      title="Copy link"
                    >
                      {copiedSlug === item.slug ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg border border-[#00ff41]/20 text-[#00ff41]/70 hover:text-[#00ff41] hover:border-[#00ff41]/35 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
