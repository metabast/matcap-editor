import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de Three.js pour les tests
vi.mock('three', () => ({
  Scene: vi.fn(() => ({})),
  PerspectiveCamera: vi.fn(() => ({})),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas')
  })),
  RectAreaLight: vi.fn(() => ({})),
  SpotLight: vi.fn(() => ({})),
  DirectionalLight: vi.fn(() => ({})),
  Vector3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
  Color: vi.fn(() => ({ r: 1, g: 1, b: 1 }))
}))

// Mock de nanoevents
vi.mock('nanoevents', () => ({
  createNanoEvents: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn()
  }))
}))

// Mock du localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
})

// Mock de console pour réduire le bruit dans les tests
const originalConsole = { ...console }

beforeEach(() => {
  // Mock des méthodes de console pour éviter le spam dans les tests
  console.log = vi.fn()
  console.info = vi.fn()
  console.debug = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
})

afterEach(() => {
  // Restaurer console après chaque test
  Object.assign(console, originalConsole)
  
  // Nettoyer les mocks
  vi.clearAllMocks()
})
