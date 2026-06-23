import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import emojiSucursales from '../../pages/Sucursales'

vi.mock('../../api/client', () => ({
  getSucursales: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ hasRole: () => true }),
}))

describe('Sucursales', () => {
  it('exports Sucursales component', () => {
    expect(emojiSucursales).toBeDefined()
  })
})
