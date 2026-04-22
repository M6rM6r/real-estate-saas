'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Listing {
  id: string
  title: string
  content: string
  images: string[]
  price: number
  location: string
}

interface ListingsSectionProps {
  listings: Listing[]
}

export default function ListingsSection({ listings }: ListingsSectionProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectedListings = listings.filter(l => selected.includes(l.id))

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Properties</h2>
        {selected.length > 0 && (
          <Button onClick={() => setCompareOpen(true)}>Compare ({selected.length})</Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listings.map(listing => (
          <div key={listing.id} className="border p-4 rounded">
            <Checkbox
              checked={selected.includes(listing.id)}
              onCheckedChange={() => toggleSelect(listing.id)}
              className="mb-2"
            />
            <img src={listing.images[0]} alt={listing.title} className="w-full h-48 object-cover mb-2" />
            <h3 className="font-bold">{listing.title}</h3>
            <p>{listing.location}</p>
            <p className="font-bold">${listing.price}</p>
          </div>
        ))}
      </div>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare Properties</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedListings.map(listing => (
              <div key={listing.id} className="border p-4 rounded">
                <img src={listing.images[0]} alt={listing.title} className="w-full h-32 object-cover mb-2" />
                <h3 className="font-bold">{listing.title}</h3>
                <p>{listing.location}</p>
                <p className="font-bold">${listing.price}</p>
                <p className="text-sm">{listing.content.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}