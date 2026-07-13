# start.ps1 — levanta Prepped completo (backend + frontend) en Windows.
# Uso: clic derecho > "Ejecutar con PowerShell", o en una terminal:  .\start.ps1
# Abre dos ventanas (una por servidor) y tu navegador en la página.

$root = $PSScriptRoot

Write-Host "Levantando backend (API + seed) en http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\backend'; uv run python -m app.data.synthetic; uv run uvicorn app.main:app --host 127.0.0.1 --port 8000"
)

Write-Host "Levantando frontend (pagina web) en http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\frontend'; npm run dev"
)

Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"
Write-Host "Listo. La pagina web esta en http://localhost:5173 (cierra las dos ventanas para apagar)." -ForegroundColor Cyan
