import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { quitarApiFalsa } from './apiFalsa.js'

// Cada prueba parte de cero (aislamiento): DOM limpio, almacenamiento vacío y espías restaurados
beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  quitarApiFalsa() // devuelve a axios su adaptador real
  vi.useRealTimers()
})
