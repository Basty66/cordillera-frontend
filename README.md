# Grupo Cordillera - Frontend

Frontend de la Plataforma de Monitoreo Inteligente. SPA construida con **React 19 + Vite 8 + Tailwind CSS v4**.

## Tecnologías

- React 19, Vite 8, Tailwind CSS v4
- React Router DOM v7 para navegación
- Chart.js + react-chartjs-2 para gráficos
- Axios para peticiones HTTP
- Vitest + Testing Library para pruebas

## Inicio Rápido

### Desarrollo local
`ash
npm install
npm run dev
`

### Producción
`ash
npm run build
npm run preview
`

### Docker
`ash
docker build -t cordillera-frontend .
docker run -p 80:80 cordillera-frontend
`

## Pruebas

`ash
# Ejecutar tests
npm test

# Reporte de cobertura
npm run coverage
`

18 tests (API, Context, Hooks, Componentes, Pages)

## Puertos

| Entorno | Puerto |
|---|---|
| Desarrollo | :5173 |
| Producción (Docker) | :80 |

## Funcionalidades

- Dashboard con gráficos de ventas, productos y métricas
- Gestión de productos, sucursales y ventas
- Sistema de autenticación JWT (login con roles)
- Tickets de soporte con clasificación por IA
- Visualización de indicadores económicos (UF, USD, IPC)
- Clima en tiempo real por sucursal (OpenWeatherMap)
- Modo oscuro persistente
- Rutas protegidas por rol (Admin, Vendedor, Bodeguero)
