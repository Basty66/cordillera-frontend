import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SplashScreen from '../../components/SplashScreen'

describe('SplashScreen', () => {
  it('renders logo and name', () => {
    render(<SplashScreen onFinish={vi.fn()} />)
    expect(screen.getByText('Grupo Cordillera')).toBeInTheDocument()
  })
})
