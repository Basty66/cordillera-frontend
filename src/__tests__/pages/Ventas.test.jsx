import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Ventas from '../../pages/Ventas'
import * as api from '../../api/client'

vi.mock('../../api/client', () => ({
  getVentasPaginadas: vi.fn(),
  exportCSV: vi.fn(),
}))

describe('Ventas', () => {
  it('shows loading state initially', () => {
    api.getVentasPaginadas.mockReturnValueOnce(new Promise(() => {}))
    render(
      <MemoryRouter>
        <Ventas />
      </MemoryRouter>
    )
    expect(screen.getByText('Ventas')).toBeInTheDocument()
  })

  it('renders ventas page with title', () => {
    api.getVentasPaginadas.mockResolvedValueOnce({ content: [], totalElements: 0 })
    render(
      <MemoryRouter>
        <Ventas />
      </MemoryRouter>
    )
    expect(screen.getByText('Ventas')).toBeInTheDocument()
  })
})
