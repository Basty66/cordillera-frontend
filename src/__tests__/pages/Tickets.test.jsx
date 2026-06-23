import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Tickets from '../../pages/Tickets'
import * as api from '../../api/client'

vi.mock('../../api/client', () => ({
  getTickets: vi.fn(),
  getTicketAnalytics: vi.fn(),
  createTicket: vi.fn(),
  updateTicketStatus: vi.fn(),
  deleteTicket: vi.fn(),
  clasificarTicket: vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'test', rol: 'ADMIN' } }),
}))

describe('Tickets', () => {
  it('renders tickets page with title', async () => {
    api.getTickets.mockResolvedValueOnce([])
    api.getTicketAnalytics.mockResolvedValueOnce({
      totalTickets: 0, abiertos: 0, enProgreso: 0, criticosAbiertos: 0,
      porCategoria: {}, tiempoPromedioResolucionHoras: 0,
    })
    render(
      <MemoryRouter>
        <Tickets />
      </MemoryRouter>
    )
    expect(screen.getByText('Tickets')).toBeInTheDocument()
  })
})
