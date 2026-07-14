# Prepped — Backend

FastAPI + Pydantic v2 + SQLModel (SQLite). Solo necesario para **AT-3** (extracción
idempotente). AT-1 y AT-2 corren en el frontend sin este backend.

## Requisitos
- [uv](https://docs.astral.sh/uv/)
- `OPENAI_API_KEY` en el `.env` de la raíz del repo (para extracción real; los tests la mockean).

## Correr

```bash
uv sync                                   # instala deps
uv run python -m app.data.synthetic       # siembra DB + escribe synthetic/test_user.json
uv run uvicorn app.main:app --reload      # http://localhost:8000  (docs en /docs)
```

## Tests

```bash
uv run pytest        # AT-1, AT-2, AT-3 (extracción mockeada) y test de costura
```

## Endpoints

| Método | Ruta                     | Qué hace                                            |
|--------|--------------------------|-----------------------------------------------------|
| GET    | `/api/health`            | Estado + si el LLM está configurado + disclaimer.   |
| GET    | `/api/history`           | Series por marcador + flags (worst-first).          |
| GET    | `/api/marker/{marker_id}`| Serie de un marcador + acción pre-armada si aplica. |
| POST   | `/api/reminder`          | Activa un recordatorio (idempotente).               |
| POST   | `/api/upload`            | Extrae un reporte y lo ingesta sin duplicar (AT-3). |
| POST   | `/api/chat`              | Asistente grounded (tool-calling sobre datos calc). |

## Estructura

```
app/
  api/          rutas (adaptadores finos, sin lógica de salud)
  extraction/   LLM (extracción): schema + prompt + cliente OpenAI
  assistant/    LLM (chat grounded): prompt + tools engine-backed + loop tool-calling
  engine/       determinista: ranges, trends, flags, actions (NUNCA llama al modelo)
  models/       db.py (SQLModel/SQLite) + domain.py (tablas)
  data/         markers_catalog, reference_ranges (curados), synthetic (generador)
  ingest.py     escritura idempotente (hash de archivo + dedup por profile/marker/date)
tests/          test_at1/at2/at3 + test_assistant + test_boundary
```

## La frontera del LLM (no negociable)

`engine/` nunca importa `extraction/`, `assistant/` ni `openai`. Lo verifica `tests/test_boundary.py`.
El modelo transcribe (extracción), verbaliza y —en el chat— da insights ligeros leyendo lo que el
`engine/` ya calculó vía herramientas; nunca calcula ni juzga un resultado por su cuenta.
