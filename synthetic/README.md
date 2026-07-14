# Datos sintéticos

Todo aquí es **100% sintético** — no hay datos reales de pacientes.

- `test_user.json` — dataset demo generado por `backend/app/data/synthetic.py`
  (cuenta **test_user**: 4 estudios en ~18 meses; glucosa y HbA1c suben a rojo, LDL en ámbar).
  Se regenera con:

  ```bash
  cd backend && uv run python -m app.data.synthetic
  ```

  Es un export de referencia del dataset con el que se siembra la cuenta showcase. El historial
  de la app se sirve desde la base de datos (backend), no desde este archivo.

## PDF demo para AT-3 (pendiente)

Para ejercitar el flujo de subida (extracción real con OpenAI) hace falta un PDF/foto de un
estudio de laboratorio. Coloca aquí tu archivo demo (p. ej. `lab_demo.pdf`) y súbelo desde la
vista **Subir estudio**. Debe contener marcadores del catálogo (glucosa, HbA1c, LDL, etc.).
Mantén cualquier archivo aquí **sintético/anonimizado**.
