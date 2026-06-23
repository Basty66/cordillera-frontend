import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotificationBell from '../../components/NotificationBell'

describe('NotificationBell', () => {
  it('renders bell button with count', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    )
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
