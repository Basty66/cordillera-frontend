import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'

const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null })
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute><div>protected</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(container.innerHTML).not.toContain('protected')
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { rol: 'ADMIN', nombre: 'Admin' },
    })
    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute><div>protected content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('protected content')).toBeInTheDocument()
  })

  it('shows denied message when role mismatch', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { rol: 'VENDEDOR', nombre: 'Vendedor' },
    })
    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute roles={['ADMIN']}><div>admin only</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
  })
})
