import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Profile from '../../pages/Profile'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'admin', rol: 'ADMIN', nombre: 'Admin User', email: 'admin@test.com' },
  }),
}))

vi.mock('../../api/client', () => ({
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}))

describe('Profile', () => {
  it('renders user profile information', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByText('@admin')).toBeInTheDocument()
  })

  it('renders profile edit form', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )
    expect(screen.getByText('Información Personal')).toBeInTheDocument()
    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument()
  })

  it('renders form fields with user data', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )
    const nameInput = screen.getByDisplayValue('Admin User')
    expect(nameInput).toBeInTheDocument()
  })
})
