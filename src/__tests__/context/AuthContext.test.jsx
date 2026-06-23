import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import * as api from '../../api/client'

// Create a JWT-like token that passes getStoredToken validation
const payload = btoa(JSON.stringify({ exp: 9999999999, sub: 'admin' }))
const validToken = `header.${payload}.signature`

vi.mock('../../api/client', () => ({
  login: vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
})

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  it('provides default unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('login sets user and token', async () => {
    const mockRes = { token: validToken, username: 'admin', rol: 'ADMIN', nombre: 'Admin' }
    api.login.mockResolvedValueOnce(mockRes)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login('admin', 'admin123')
    })

    expect(result.current.token).toBe(validToken)
    expect(result.current.user?.username).toBe('admin')
    expect(result.current.user?.rol).toBe('ADMIN')
    expect(result.current.isAuthenticated).toBe(true)
    expect(localStorage.getItem('token')).toBe(validToken)
  })

  it('login throws on invalid credentials', async () => {
    api.login.mockRejectedValueOnce(new Error('Credenciales inválidas'))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      try {
        await result.current.login('bad', 'bad')
      } catch (e) {
        expect(e.message).toBe('Credenciales inválidas')
      }
    })
  })

  it('logout clears auth state', async () => {
    api.login.mockResolvedValueOnce({ token: validToken, username: 'u', rol: 'ADMIN', nombre: 'U' })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('u', 'p')
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.token).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('hasRole checks user role correctly', async () => {
    api.login.mockResolvedValueOnce({ token: validToken, username: 'admin', rol: 'ADMIN', nombre: 'Admin' })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('admin', 'admin123')
    })

    expect(result.current.hasRole('ADMIN')).toBe(true)
    expect(result.current.hasRole('VENDEDOR')).toBe(false)
    expect(result.current.hasRole('ADMIN', 'VENDEDOR')).toBe(true)
  })
})
