import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'
import * as api from '../../api/client'

vi.mock('../../api/client', () => ({
  getDashboard: vi.fn(),
  getIndicadoresEconomicos: vi.fn(),
  getClimaSucursales: vi.fn(),
  getTicketAnalytics: vi.fn(),
}))

describe('Dashboard', () => {
  it('shows loading skeleton initially', () => {
    api.getDashboard.mockReturnValueOnce(new Promise(() => {}))
    api.getIndicadoresEconomicos.mockReturnValueOnce(new Promise(() => {}))
    api.getClimaSucursales.mockReturnValueOnce(new Promise(() => {}))
    api.getTicketAnalytics.mockReturnValueOnce(new Promise(() => {}))
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    // Should show skeleton placeholder
    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
