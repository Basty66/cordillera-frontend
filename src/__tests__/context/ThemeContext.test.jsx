import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from '../../context/ThemeContext'

describe('ThemeContext', () => {
  it('adds dark class to documentElement', () => {
    render(
      <ThemeProvider>
        <div>test</div>
      </ThemeProvider>
    )
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('renders children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>hello world</div>
      </ThemeProvider>
    )
    expect(getByText('hello world')).toBeInTheDocument()
  })
})
