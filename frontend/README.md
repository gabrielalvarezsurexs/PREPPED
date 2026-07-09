# Prepped — Frontend

Vite + React + TypeScript + Recharts. **AT-1 y AT-2 corren aquí sin backend**, sobre la
data sintética sembrada (`src/data/seed.ts`). El backend solo se necesita para AT-3 (subir estudio).

## Correr

```bash
npm install
npm run dev            # http://localhost:5173
```

Para la subida (AT-3), copia `.env.example` a `.env` y apunta `VITE_API_URL` al backend, y
levanta el backend (ver `../backend/README.md`).

## Scripts
- `npm run dev` — servidor de desarrollo.
- `npm run build` — typecheck + build de producción.
- `npm run typecheck` — solo chequeo de tipos.

## Estructura

```
src/
  types.ts            tipos de dominio (espejo del backend)
  data/catalog.ts     catálogo + rangos curados (espejo de reference_ranges.py)
  data/seed.ts        data sintética de Rafael (AT-1/AT-2 sin backend)
  engine.ts           motor determinista en cliente (classify/trends/actions)
  api/client.ts       cliente del backend (solo AT-3)
  views/              History, MarkerDetail, Upload
  components/          TrendChart, FlagBadge, ActionCard, Disclaimer
```

> El catálogo y los rangos del frontend son un **espejo curado** del backend para que AT-1/AT-2
> no necesiten servidor. Manténlos en sincronía con `backend/app/data/`.
