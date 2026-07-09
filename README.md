# Prepped

Prepped es una web app open-source que convierte tus estudios de laboratorio dispersos en **un
solo historial de salud**, en lenguaje claro.

Subes tus estudios como foto o PDF. Prepped lee los marcadores, sigue cada uno a lo largo del
tiempo, marca lo que sale de rango con una regla conservadora de semáforo, y cuando algo está fuera
te entrega un **siguiente paso listo**: una pregunta para tu doctor, o un recordatorio para agendar
un chequeo.

Es para cualquiera que se haga estudios de laboratorio, ya sea que necesite ayuda para leerlos o
solo para llevarles el rastro con el tiempo. No se requiere conocimiento médico.

> ⚕️ **Prepped no es una herramienta de diagnóstico ni un asesor médico.** No dice qué enfermedad
> tienes, no da tratamiento, dosis ni dieta, y la ausencia de una alerta nunca significa "estás
> bien". Consulta siempre a un profesional de salud.

---

## La regla que gobierna todo (no negociable)

Esta frontera **es** el producto. Todo lo demás es detalle.

- **Toda la lógica de salud es determinista y la calcula nuestro propio código** (`backend/app/engine/`):
  tendencia por marcador, clasificación de rango (in-range / amber / red) contra una tabla curada,
  y alertas por umbrales fijos y conservadores.
- **El LLM hace tres cosas, siempre sobre resultados ya calculados:**
  1. **Extracción**: leer un PDF o foto y devolver mediciones estructuradas (visión + structured output).
  2. **Verbalización**: poner resultados ya calculados en lenguaje claro (acciones pre-armadas).
  3. **Chat grounded**: responde solo desde tus propios datos calculados, que lee mediante
     herramientas respaldadas por el motor determinista (tool-calling). Da orientación e
     **insights ligeros**, no diagnostica.
- **El LLM NUNCA** calcula una tendencia, decide si un valor está en rango, inventa un rango de
  referencia, diagnostica, indica tratamiento/dosis/dieta ni reasegura. Si te encuentras pidiéndole
  al modelo que "juzgue" un resultado, para: eso va en código determinista.

La costura entre `engine/` (determinista) y las superficies con LLM (`extraction/`, `assistant/`) es
dura y está protegida por un test (`backend/tests/test_boundary.py`): el motor nunca importa el modelo.

---

## Definición de "listo" (los 3 acceptance tests)

- **AT-1 — Ver la tendencia, no un solo valor.** Con 2+ reportes cargados y un marcador fuera de
  rango, al abrir resultados ese marcador se ve en una gráfica temporal con el último punto marcado
  (rojo o ámbar), no como un número suelto.
- **AT-2 — Cada alerta trae un siguiente paso en un tap.** Al tocar un marcador fuera de rango,
  aparece una acción lista en un tap (pregunta para el doctor o recordatorio), sin nada que escribir.
- **AT-3 — El historial se construye solo.** Al subir un reporte (foto/PDF), los marcadores se
  extraen y se agregan sin escribir, y re-subir el mismo reporte no crea duplicados.

---

## Arquitectura

```
[ingest]   upload -> extracción LLM (schema Pydantic) -> normaliza -> escritura idempotente
[compute]  engine determinista: series por marcador, clasificación de rango, flags, acciones
[present]  React: historial (Recharts + flags de color), detalle de marcador (texto + acción en un tap)
[assist]   chat grounded: LLM lee los datos ya calculados vía tool-calling y da insights ligeros
```

- **Frontend** (`frontend/`): Vite + React + TypeScript + Recharts. AT-1 y AT-2 corren **sin
  backend** sobre data sintética sembrada.
- **Backend** (`backend/`): FastAPI + Pydantic v2 + SQLModel (SQLite). Solo necesario para AT-3.
- **LLM**: OpenAI (visión + structured outputs).

Ver la estructura completa de carpetas y el detalle de módulos en [`CLAUDE.md`](CLAUDE.md).

---

## Quickstart

### Requisitos
- [uv](https://docs.astral.sh/uv/) (backend Python)
- Node.js 18+ (frontend)

### 1. Configura el entorno
```bash
cp .env.example .env
# edita .env y pon tu OPENAI_API_KEY
```

### 2. Frontend (AT-1 + AT-2, sin backend)
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

### 3. Backend (AT-3: extracción idempotente)
```bash
cd backend
uv sync
uv run python -m app.data.synthetic     # siembra DB + genera synthetic/*.json
uv run uvicorn app.main:app --reload    # http://localhost:8000
```

### Tests
```bash
cd backend
uv run pytest          # AT-1, AT-2, AT-3 y el test de costura
```

---

## Estado y roadmap

Prototipo en construcción. Prioridad absoluta: poner AT-1, AT-2 y AT-3 en verde. Todo lo demás
(clinic locator con Google Places, chat grounded, auth) queda fuera hasta lograrlo.
Ver [`ROADMAP.md`](ROADMAP.md).

## Licencia

Open-source. Toda la data incluida en el repo es **sintética**; no hay datos reales de pacientes.
