# Reportes de laboratorio sintéticos (para pruebas)

Archivos HTML con pinta de reporte de laboratorio real, 100% inventados. Sirven para
probar la subida y extracción (AT-3) y ver la tendencia moverse en el tiempo.

## Cómo convertirlos a PDF

1. Abre el `.html` en el navegador (doble clic).
2. `Ctrl + P` → Destino: **Guardar como PDF** → Guardar.

## Los archivos (mismo paciente, valores subiendo)

| Archivo | Fecha | Glucosa | HbA1c | LDL | Colesterol |
|---|---|---|---|---|---|
| `lab_report_2024-03-10.html` | 10/03/2024 | 96 | 5.5 | 108 | 188 |
| `lab_report_2024-09-15.html` | 15/09/2024 | 108 | 5.8 | 120 | 196 |
| `lab_report_2025-03-20.html` | 20/03/2025 | 119 | 6.1 | 131 | 206 |

Súbelos en orden por la pantalla **Upload** para ver glucosa/HbA1c/LDL escalando hacia
rojo. Volver a subir el mismo archivo **no** crea duplicados (idempotencia de AT-3).
