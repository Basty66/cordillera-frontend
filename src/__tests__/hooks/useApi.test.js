import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApi, useMutation } from '../../hooks/useApi'
import client from '../../api/client'

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with loading state', () => {
    client.get.mockReturnValueOnce(new Promise(() => {}))
    const { result } = renderHook(() => useApi('/test'))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'test' }
    client.get.mockResolvedValueOnce({ data: mockData })

    const { result } = renderHook(() => useApi('/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    client.get.mockRejectedValueOnce({
      response: { data: { error: 'Not found' } },
      message: 'Request failed',
    })

    const { result } = renderHook(() => useApi('/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeNull()
  })
})

describe('useMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('executes POST successfully', async () => {
    client.post.mockResolvedValueOnce({ data: { id: 1 } })
    const { result } = renderHook(() => useMutation('/test', 'POST'))

    let data
    await act(async () => {
      data = await result.current.execute({ name: 'test' })
    })
    expect(data).toEqual({ id: 1 })
  })

  it('handles mutation error', async () => {
    client.post.mockRejectedValueOnce({
      response: { data: { error: 'Conflict' } },
      message: 'Conflict',
    })
    const { result } = renderHook(() => useMutation('/test', 'POST'))

    await act(async () => {
      try { await result.current.execute({}) } catch {}
    })
    expect(result.current.error).toBeTruthy()
  })
})
