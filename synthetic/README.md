# Datos sintéticos

Todo aquí es **100% sintético** — no hay datos reales de pacientes.

- `rafael.json` — dataset demo generado por `backend/app/data/synthetic.py`
  (persona **Rafael, 57**: 4 estudios en ~18 meses; glucosa y HbA1c suben a rojo, LDL en ámbar).
  Se regenera con:

  ```bash
  cd backend && uv run python -m app.data.synthetic
  ```

  El frontend NO lee este archivo: usa su propio espejo en `frontend/src/data/seed.ts`
  (mismos valores) para que AT-1/AT-2 corran sin backend. `rafael.json` sirve para sembrar la
  DB y como export de referencia.

## PDF demo para AT-3 (pendiente)

Para ejercitar el flujo de subida (extracción real con OpenAI) hace falta un PDF/foto de un
estudio de laboratorio. Coloca aquí tu archivo demo (p. ej. `lab_demo.pdf`) y súbelo desde la
vista **Subir estudio**. Debe contener marcadores del catálogo (glucosa, HbA1c, LDL, etc.).
Mantén cualquier archivo aquí **sintético/anonimizado**.
