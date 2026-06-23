import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../../components/Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders page numbers', () => {
    render(
      <Pagination page={1} totalPages={5} total={100} onPageChange={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('100 registros'))).toBeInTheDocument()
  })

  it('calls onPageChange when clicking page', () => {
    const onChange = vi.fn()
    render(
      <Pagination page={1} totalPages={5} onPageChange={onChange} />
    )
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('disables previous button on first page', () => {
    render(
      <Pagination page={1} totalPages={5} onPageChange={vi.fn()} />
    )
    const buttons = screen.getAllByRole('button')
    const prevBtn = buttons[0]
    expect(prevBtn).toBeDisabled()
  })
})
