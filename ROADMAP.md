# Roadmap de Prepped

Prioridad única hasta el primer verde: **poner AT-1, AT-2 y AT-3 en verde**. No se agrega scope
que ningún test requiera.

## Leyenda
- ✅ hecho · 🚧 en curso · ⬜ pendiente

---

## Fase 0 — Scaffold ✅
- ✅ Estructura de carpetas, docs (README/ROADMAP/CLAUDE), `.env.example`, `.gitignore`.
- ✅ Base backend (uv, FastAPI, SQLModel) y frontend (Vite + React + TS).

## Fase 1 — Catálogo y rangos curados ⬜
- ⬜ Catálogo canónico de marcadores demo (`data/markers_catalog.py`).
- ⬜ Tabla curada de rangos de referencia (`data/reference_ranges.py`) — nunca generada por el modelo.

## Fase 2 — AT-1: ver la tendencia ⬜
- ⬜ Generador de data sintética longitudinal (persona **Rafael, 57**).
- ⬜ `engine/ranges.py` (classify) y `engine/trends.py` (series).
- ⬜ Frontend `History` + `TrendChart` (Recharts, último punto coloreado por status).
- **Verde cuando**: con 2+ reportes y un marcador fuera de rango, la gráfica muestra el último punto
  marcado en rojo/ámbar.

## Fase 3 — AT-2: siguiente paso en un tap ⬜
- ⬜ `engine/flags.py` (flag del último punto) y `engine/actions.py` (acción pre-armada, copy curado).
- ⬜ Frontend `MarkerDetail` + `ActionCard` (pregunta pre-escrita + botón "Poner recordatorio").
- **Verde cuando**: al tocar un marcador fuera de rango aparece una acción lista en un tap, sin escribir.

## Fase 4 — AT-3: el historial se construye solo ⬜ (parte de riesgo)
- ⬜ `extraction/` (schema Pydantic + prompt + cliente OpenAI visión/structured output).
- ⬜ `api/upload.py`: hash de archivo → extracción → dedup por `(profile, marker, date)`.
- ⬜ Escritura idempotente en SQLite; PDF demo para ejercitar el flujo.
- **Verde cuando**: subir el reporte agrega marcadores sin escribir, y re-subirlo no duplica.

## Fase 5 — Chat assistant grounded ✅ (prototipo)
- ✅ Herramientas read-only respaldadas por el `engine/` (`assistant/tools.py`).
- ✅ Loop de tool-calling con OpenAI (`assistant/chat.py`) + prompt con guardrails.
- ✅ Ruta `POST /api/chat` y vista `Asistente` en el frontend.
- **Alcance**: responde solo desde los datos ya calculados; da insights ligeros; no diagnostica,
  no trata, no reasegura. El motor sigue siendo el único que calcula.

## Fase 6 — Post-verde (fuera de este scaffold) ⬜
- ⬜ Clinic locator con Google Places (dependencia externa; fuera del loop rojo→verde).
- ⬜ Verbalización con LLM del texto de detalle (hoy: copy curado determinista).
- ⬜ Streaming de respuestas del chat + memoria de conversación persistida.
- ⬜ Pulido de UI, responsive fino, accesibilidad.
- ⬜ Migración de SQLite a PostgreSQL (misma forma de schema).
- ⬜ Auth y multi-perfil (hoy: un perfil local).

---

## Guardrails permanentes (no se relajan en ninguna fase)
- Sin diagnóstico, tratamiento, dosis ni dieta.
- Nunca reasegurar: la ausencia de alerta no es "todo bien".
- Rangos solo desde la tabla curada, nunca del modelo.
- Escalación por umbrales fijos y conservadores.
- Disclaimer visible en toda pantalla.
- `engine/` nunca importa `extraction/` ni llama al modelo (test de costura).
