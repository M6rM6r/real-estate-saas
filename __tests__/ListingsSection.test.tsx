import { render, screen } from '@testing-library/react'
import ListingsSection from '@/components/ListingsSection'

const mockListings = [
  { id: '1', title: 'House 1', content: 'Nice house', images: ['/img1.jpg'], price: 100000, location: 'City' },
  { id: '2', title: 'House 2', content: 'Another house', images: ['/img2.jpg'], price: 200000, location: 'Town' },
]

describe('ListingsSection', () => {
  it('renders listings', () => {
    render(<ListingsSection listings={mockListings} />)
    expect(screen.getByText('Properties')).toBeInTheDocument()
    expect(screen.getByText('House 1')).toBeInTheDocument()
  })
})