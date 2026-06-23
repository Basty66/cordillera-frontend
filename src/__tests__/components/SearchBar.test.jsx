import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SearchBar from '../../components/SearchBar'

describe('SearchBar', () => {
  it('renders search trigger button', () => {
    render(
      <MemoryRouter>
        <SearchBar isAdmin={false} />
      </MemoryRouter>
    )
    expect(screen.getByText('Buscar...')).toBeInTheDocument()
  })
})
