import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Productos from '../../pages/Productos'
import * as api from '../../api/client'

vi.mock('../../api/client', () => ({
  getProductos: vi.fn(),
  updateProducto: vi.fn(),
  deleteProducto: vi.fn(),
  exportCSV: vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    hasRole: () => true,
    user: { rol: 'ADMIN' },
  }),
}))

describe('Productos', () => {
  it('renders productos page with title', () => {
    api.getProductos.mockResolvedValueOnce([])
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )
    expect(screen.getByText('Productos')).toBeInTheDocument()
  })

  it('shows category filters', () => {
    api.getProductos.mockResolvedValueOnce([])
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    )
    expect(screen.getByText('Todas')).toBeInTheDocument()
    expect(screen.getByText('Electrónica')).toBeInTheDocument()
  })
})
