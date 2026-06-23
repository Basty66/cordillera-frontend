import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DetailModal from '../../components/DetailModal'

describe('DetailModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <DetailModal open={false} onClose={vi.fn()} title="Test">
        <div>content</div>
      </DetailModal>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders content when open', () => {
    render(
      <DetailModal open={true} onClose={vi.fn()} title="Test Title">
        <div>modal content</div>
      </DetailModal>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('modal content')).toBeInTheDocument()
  })

  it('calls onClose when clicking overlay', () => {
    const onClose = vi.fn()
    render(
      <DetailModal open={true} onClose={onClose} title="Test">
        <div>content</div>
      </DetailModal>
    )
    const overlay = screen.getByText('content').closest('.fixed')
    if (overlay) fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })
})
