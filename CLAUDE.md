# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Fuente de verdad de Prepped. Mantiene alineada cada sesión sobre **qué** construimos y, sobre
> todo, sobre la **frontera del LLM**. Actualízalo cuando cambien decisiones. (Docs en español;
> código, comentarios y commits en inglés.)

## Qué es Prepped

Web app open-source que unifica estudios de laboratorio dispersos en un historial de salud en
lenguaje claro. Sube foto/PDF → extrae marcadores → sigue cada uno en el tiempo → marca lo fuera de
rango con semáforo conservador → entrega un siguiente paso listo (pregunta al doctor o recordatorio).

No es: herramienta de diagnóstico, asesor médico, GPT wrapper / chatbot médico abierto, máquina de
tranquilizar, ni app nativa (es una web page responsive; "tap" = click/tap en el navegador).

## La frontera de arquitectura (NO NEGOCIABLE)

**Toda la lógica de salud es determinista y la calcula nuestro código** (`backend/app/engine/`):
tendencia por marcador, clasificación de rango (in_range/amber/red) contra tabla curada, flags y
escalación por umbrales fijos.

**El LLM hace tres cosas, todas sobre resultados YA calculados:**
1. **Extracción**: leer PDF/foto → mediciones estructuradas (visión + structured output).
2. **Verbalización**: poner resultados YA calculados en lenguaje claro (acciones pre-armadas).
3. **Chat grounded** (`assistant/`): responde SOLO desde los datos del usuario, leídos con
   herramientas respaldadas por el `engine/` (tool-calling). Puede dar **insights ligeros** y
   contexto general, pero no computa ni inventa nada.

**El LLM NUNCA**: computa una tendencia, decide si un valor está en rango, inventa un rango de
referencia, diagnostica, indica tratamiento/dosis/dieta ni reasegura. Si te descubres pidiéndole al
modelo que "juzgue" un resultado, para — eso va en `engine/`. El chat interpreta, el `engine/` calcula.

**Costura dura**: `engine/` nunca importa `extraction/`, `assistant/` ni `openai`. Protegido por
`backend/tests/test_boundary.py`. (El `assistant/` sí llama al modelo: es superficie de
verbalización, no motor; solo LEE lo que el `engine/` ya calculó.)

## Los 3 acceptance tests (definición de "listo")

- **AT-1**: 2+ reportes y un marcador fuera de rango → gráfica temporal con el último punto marcado.
- **AT-2**: tocar un marcador fuera de rango → acción lista en un tap, sin escribir.
- **AT-3**: subir foto/PDF → marcadores extraídos sin escribir; re-subir el mismo archivo no duplica.

Construir solo lo necesario para ponerlos en verde.

## Comandos

`.env` vive en la raíz del repo (copia `.env.example`). Necesita `OPENAI_API_KEY` para
extracción (AT-3) y chat; los tests la mockean, no requieren red.

Backend (`cd backend`, gestionado con **uv**):

```bash
uv sync --extra dev                       # instala deps + dev (pytest, ruff, httpx)
uv run python -m app.data.synthetic       # siembra SQLite + escribe synthetic/test_user.json
uv run uvicorn app.main:app --reload      # API en :8000 (docs en /docs)
uv run pytest                             # toda la suite
uv run pytest tests/test_at3_idempotent.py                       # un archivo
uv run pytest tests/test_at3_idempotent.py::test_same_file_reupload_creates_no_duplicates  # un test
uv run ruff check app tests               # lint (línea 110; B008 ignorado por FastAPI)
uv run ruff check --fix app tests         # autofix
```

Frontend (`cd frontend`, npm):

```bash
npm install
npm run dev            # Vite en :5173 (AT-1/AT-2 corren aquí SIN backend)
npm run build          # tsc -b && vite build (typecheck + build)
npm run typecheck      # solo tipos
```

No hay runner de tests en el frontend todavía; la verificación del cliente es `npm run build`.

## Estructura del repo

```
backend/app/
  api/          routes: upload (AT-3), history, marker, reminder, chat + common.py (deps compartidas)
  extraction/   LLM extracción: schema pydantic + prompt + cliente OpenAI
  assistant/    LLM chat grounded: prompt (ES/EN) + tools engine-backed + loop tool-calling (chat.py)
  engine/       determinista: ranges, trends, flags, actions     (NUNCA llama al modelo)
  ingest.py     escritura idempotente (file_hash + dedup por profile/marker/date)
  models/       db.py (SQLModel/SQLite) + domain.py (tablas)
  data/         markers_catalog, reference_ranges (curados), synthetic (generador)
  config.py     pydantic-settings; lee .env de la raíz
backend/tests/  test_at1/at2/at3 + test_assistant + test_boundary (conftest redirige la DB a temp)
frontend/src/
  engine.ts     ESPEJO en cliente del engine (classify/trends/actions) para AT-1/AT-2 sin backend
  data/         catalog.ts (rangos curados, espejo) + seed.ts (data sintética Rafael)
  i18n/         selector de idioma ES/EN: strings.ts (diccionario tipado), LanguageContext.tsx
                (provider + useLang, persiste en localStorage), markerNames.ts (nombres ES/EN)
  views/        Splash, History, MarkerDetail, Upload, Assistant, Updates, About (con link al repo)
  components/    TrendChart, FlagBadge, ActionCard, Disclaimer, LanguageToggle
  api/client.ts fetch al backend (upload + chat con lang)
synthetic/      datasets demo generados (JSON) + PDF demo
```

**i18n (ES/EN)**: toda la copy de UI vive en `frontend/src/i18n/strings.ts` (`es` es la forma
canónica; `Strings = typeof es` obliga a `en` a cubrir cada clave en compilación). `LanguageProvider`
envuelve `App` en `main.tsx`; default español, elección recordada en `localStorage` y reflejada en
`<html lang>`. El chat responde en el idioma elegido: `sendChat(messages, lang)` → `/api/chat`
(`ChatRequest.lang`) → `run_chat(..., lang)` → `prompt_for(lang)` (`SYSTEM_PROMPT_ES/EN`, mismos
guardrails). La app arranca en la **pantalla de inicio** (Splash) y entra al historial con un tap.

**Doble fuente curada**: el frontend duplica catálogo + rangos (`frontend/src/data/catalog.ts`,
`engine.ts`) para que AT-1/AT-2 no necesiten servidor. Si cambias marcadores o rangos en
`backend/app/data/`, actualiza el espejo del frontend en el mismo commit. El **nombre display** de
cada marcador (ES/EN) vive en `frontend/src/i18n/markerNames.ts`; si agregas un marcador, añádelo ahí.

## Data model

`profiles`, `markers` (catálogo: name, unit, ref range, direction_of_concern), `reports`
(source, date, `file_hash`), `measurements` (profile_id, marker_id, value, unit, date, report_id),
`reminders` (profile_id, marker_id, type, due_date). Prototipo: un solo usuario/perfil local.

**Idempotencia**: dedup de measurements por `(profile_id, marker_id, date)`; `file_hash` en
`reports` corto-circuita re-subidas del mismo archivo. Esto hace verdadero el "no duplicados" de AT-3.

## Stack

Frontend: Vite + React + TypeScript + Recharts. Backend: FastAPI + Pydantic v2 + SQLModel (SQLite;
Postgres es el north-star). LLM: OpenAI. AT-1/AT-2 corren solo en frontend con data sembrada.

## Guardrails (en código, no solo copy)

Sin diagnóstico/tratamiento/dosis/dieta. Nunca reasegurar. Rangos solo de tabla curada.
Escalación por umbrales fijos. Disclaimer visible en toda pantalla.

## Método de trabajo

Todo se construye con Claude, planeación e implementación. Mantén este archivo en la raíz para que
cada sesión quede alineada con la frontera del LLM. Actualízalo cuando cambien decisiones.
