import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import { useToast } from '@/hooks/use-toast'

// Mock the toast hook for testing
const mockToast = jest.fn()
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe('useToast hook', () => {
  it('should be mocked properly', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast).toBeDefined()
  })
})