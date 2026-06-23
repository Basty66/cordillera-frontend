import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs'

describe('Breadcrumbs', () => {
  it('renders nothing on root path', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Breadcrumbs />
      </MemoryRouter>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders breadcrumb links for nested path', () => {
    render(
      <MemoryRouter initialEntries={['/ventas']}>
        <Breadcrumbs />
      </MemoryRouter>
    )
    expect(screen.getByText('Ventas')).toBeInTheDocument()
    expect(screen.getByText('Inicio')).toBeInTheDocument()
  })

  it('renders multiple segments', () => {
    render(
      <MemoryRouter initialEntries={['/admin/usuarios']}>
        <Breadcrumbs />
      </MemoryRouter>
    )
    expect(screen.getByText('Administración')).toBeInTheDocument()
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
  })
})
