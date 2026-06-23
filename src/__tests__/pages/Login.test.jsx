import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../../pages/Login'
import * as api from '../../api/client'

vi.mock('../../api/client', () => ({
  login: vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: api.login,
    isAuthenticated: false,
    user: null,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

describe('Login', () => {
  it('renders splash screen initially', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByText('Plataforma de Monitoreo')).toBeInTheDocument()
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
  })

  it('shows role selection after clicking iniciar sesion', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    const btn = screen.getByText('Iniciar sesión')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByText('¿Quién eres?')).toBeInTheDocument()
    })
  })

  it('shows role options', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Iniciar sesión'))
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('vendedor')).toBeInTheDocument()
      expect(screen.getByText('bodega')).toBeInTheDocument()
    })
  })
})
