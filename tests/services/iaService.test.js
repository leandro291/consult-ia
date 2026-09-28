import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { asistenteActivo, generarSugerencias } from '@/services/iaService.js'

// JSON completo y válido según el contrato de respuesta de la IA (CLAUDE.md).
function respuestaCompleta(extra = {}) {
  return {
    motivo: 'Dolor de garganta',
    signosVitales: { presion: '120/80', frecuenciaCardiaca: 92, temperatura: 38.5, peso: null, talla: null },
    examenFisico: 'Amígdalas inflamadas con placas',
    diagnosticos: [{ codigo: null, descripcion: 'Faringitis bacteriana' }],
    plan: 'Amoxicilina 500mg cada 8 horas',
    receta: [{ medicamento: 'Amoxicilina', dosis: '500mg', frecuencia: 'Cada 8 horas', duracion: '7 días', via: 'oral', indicaciones: null }],
    indicacionesPaciente: 'Reposo y abundantes líquidos',
    advertencias: [],
    ...extra
  }
}

function mockFetchOk(json, status = 200) {
  return vi.fn().mockResolvedValue({ ok: status < 400, status, text: async () => JSON.stringify(json) })
}

describe('iaService', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  describe('asistenteActivo', () => {
    it('devuelve false cuando no hay URL de servidor de IA configurada', () => {
      vi.stubEnv('VITE_IA_SERVIDOR_URL', '')
      expect(asistenteActivo()).toBe(false)
    })

    it('devuelve false cuando la URL configurada son solo espacios', () => {
      vi.stubEnv('VITE_IA_SERVIDOR_URL', '   ')
      expect(asistenteActivo()).toBe(false)
    })

    it('devuelve true cuando hay una URL de servidor de IA configurada', () => {
      vi.stubEnv('VITE_IA_SERVIDOR_URL', 'https://ia.ejemplo.com/api')
      expect(asistenteActivo()).toBe(true)
    })
  })

  describe('generarSugerencias', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_IA_SERVIDOR_URL', 'https://ia.ejemplo.com/api')
    })

    it('rechaza sin llamar a fetch cuando el asistente no está configurado', async () => {
      vi.stubEnv('VITE_IA_SERVIDOR_URL', '')
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      await expect(generarSugerencias('texto', {})).rejects.toThrow('El asistente de IA no está configurado en esta instalación.')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('envía la transcripción y el contexto por POST a la URL configurada', async () => {
      const fetchMock = mockFetchOk(respuestaCompleta())
      vi.stubGlobal('fetch', fetchMock)
      const contexto = { edad: 30, sexo: 'M', alergias: [], antecedentes: '' }

      await generarSugerencias('el paciente refiere fiebre', contexto)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ia.ejemplo.com/api',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: 'el paciente refiere fiebre', contexto })
        })
      )
    })

    it('devuelve el JSON de la respuesta cuando cumple el contrato', async () => {
      const json = respuestaCompleta()
      vi.stubGlobal('fetch', mockFetchOk(json))

      await expect(generarSugerencias('texto', {})).resolves.toEqual(json)
    })

    it('extrae el JSON aunque venga envuelto en un bloque ```json', async () => {
      const json = respuestaCompleta()
      const texto = '```json\n' + JSON.stringify(json) + '\n```'
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => texto }))

      await expect(generarSugerencias('texto', {})).resolves.toEqual(json)
    })

    it('rechaza con mensaje en español cuando la respuesta no es JSON válido', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => 'esto no es json' }))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('La respuesta de la IA no tiene el formato esperado. Puede reintentar.')
    })

    it('rechaza cuando a la respuesta le falta un campo del contrato', async () => {
      const { plan, ...sinPlan } = respuestaCompleta()
      void plan
      vi.stubGlobal('fetch', mockFetchOk(sinPlan))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('La respuesta de la IA no tiene el formato esperado. Puede reintentar.')
    })

    it('rechaza cuando a signosVitales le falta una clave del contrato', async () => {
      const json = respuestaCompleta()
      delete json.signosVitales.temperatura
      vi.stubGlobal('fetch', mockFetchOk(json))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('La respuesta de la IA no tiene el formato esperado. Puede reintentar.')
    })

    it('rechaza cuando un diagnóstico llega sin descripción', async () => {
      const json = respuestaCompleta({ diagnosticos: [{ codigo: null, descripcion: '' }] })
      vi.stubGlobal('fetch', mockFetchOk(json))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('La respuesta de la IA no tiene el formato esperado. Puede reintentar.')
    })

    it('rechaza cuando un medicamento de la receta llega sin nombre', async () => {
      const json = respuestaCompleta({ receta: [{ medicamento: '', dosis: '500mg', frecuencia: null, duracion: null, via: null, indicaciones: null }] })
      vi.stubGlobal('fetch', mockFetchOk(json))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('La respuesta de la IA no tiene el formato esperado. Puede reintentar.')
    })

    it('traduce el error 429 al mensaje de límite de uso alcanzado', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => '' }))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('Se alcanzó el límite de uso del servidor de IA. Espere un momento y reintente.')
    })

    it('traduce un error 5xx del servidor al mensaje de error del servidor', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => '' }))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('El servidor de IA tuvo un error. Intente de nuevo en unos minutos.')
    })

    it('traduce otros códigos de error HTTP a un mensaje genérico con el código', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => '' }))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('El servidor de IA respondió con un error (código 404).')
    })

    it('traduce un error de red (sin conexión) a un mensaje en español', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

      await expect(generarSugerencias('texto', {})).rejects.toThrow('No se pudo conectar con el servidor de IA. Revise su conexión o intente más tarde.')
    })

    it('agota el tiempo de espera a los 30 segundos y lo traduce a un mensaje en español', async () => {
      vi.useFakeTimers()
      vi.stubGlobal(
        'fetch',
        vi.fn((_url, opciones) => {
          return new Promise((_resolve, reject) => {
            opciones.signal.addEventListener('abort', () => {
              const error = new Error('The operation was aborted')
              error.name = 'AbortError'
              reject(error)
            })
          })
        })
      )

      // Se engancha el catch antes de avanzar el reloj para que el rechazo no quede sin manejar.
      const expectativa = expect(generarSugerencias('texto', {})).rejects.toThrow('El servidor de IA tardó más de 30 segundos en responder.')
      await vi.advanceTimersByTimeAsync(30000)
      await expectativa
    })
  })
})
