import { describe, it, expect } from 'vitest'
import {
  login, updateProfile, changePassword, getDashboard, getVentas,
  getVentasPaginadas, createVenta, getProductos, getProducto,
  createProducto, updateProducto, deleteProducto, getSucursales,
  getEmpleados, getDepartamentos, getIndicadores, getValoresActuales,
  inicializarIndicadores, getCategorias, getUsuarios, createUsuario,
  getTickets, getTicket, createTicket, updateTicketStatus, updateTicket,
  deleteTicket, getReportesDashboard, getReportesTickets,
  getVentasMensuales, getVentasPorCategoria, getTopProductos,
  getIndicadoresEconomicos, getClimaSucursales, getTicketAnalytics,
  clasificarTicket, exportJSON, exportCSV,
} from '../../api/client'

describe('API client exports', () => {
  it('exports all API functions', () => {
    expect(login).toBeDefined()
    expect(updateProfile).toBeDefined()
    expect(changePassword).toBeDefined()
    expect(getDashboard).toBeDefined()
    expect(getVentas).toBeDefined()
    expect(getVentasPaginadas).toBeDefined()
    expect(createVenta).toBeDefined()
    expect(getProductos).toBeDefined()
    expect(getProducto).toBeDefined()
    expect(createProducto).toBeDefined()
    expect(updateProducto).toBeDefined()
    expect(deleteProducto).toBeDefined()
    expect(getSucursales).toBeDefined()
    expect(getEmpleados).toBeDefined()
    expect(getDepartamentos).toBeDefined()
    expect(getIndicadores).toBeDefined()
    expect(getValoresActuales).toBeDefined()
    expect(inicializarIndicadores).toBeDefined()
    expect(getCategorias).toBeDefined()
    expect(getUsuarios).toBeDefined()
    expect(createUsuario).toBeDefined()
    expect(getTickets).toBeDefined()
    expect(getTicket).toBeDefined()
    expect(createTicket).toBeDefined()
    expect(updateTicketStatus).toBeDefined()
    expect(updateTicket).toBeDefined()
    expect(deleteTicket).toBeDefined()
    expect(getReportesDashboard).toBeDefined()
    expect(getReportesTickets).toBeDefined()
    expect(getVentasMensuales).toBeDefined()
    expect(getVentasPorCategoria).toBeDefined()
    expect(getTopProductos).toBeDefined()
    expect(getIndicadoresEconomicos).toBeDefined()
    expect(getClimaSucursales).toBeDefined()
    expect(getTicketAnalytics).toBeDefined()
    expect(clasificarTicket).toBeDefined()
    expect(exportJSON).toBeDefined()
    expect(exportCSV).toBeDefined()
  })

  it('login returns a promise', () => {
    const result = login('test', 'test')
    expect(result).toBeInstanceOf(Promise)
  })

  it('getVentasPaginadas returns a promise', () => {
    const result = getVentasPaginadas(0, 20)
    expect(result).toBeInstanceOf(Promise)
  })

  it('getDashboard returns a promise', () => {
    const result = getDashboard()
    expect(result).toBeInstanceOf(Promise)
  })
})
