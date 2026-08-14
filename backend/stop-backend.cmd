@echo off
setlocal
cd /d "%~dp0"

echo [ShipTrack] Stopping backend on port 8080...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo [ShipTrack] Killing process %%p...
    taskkill /F /T /PID %%p >nul 2>&1
)

echo [ShipTrack] Cleaning up leftover ShipTrack Java processes...
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name = 'java.exe'\" | Where-Object { $_.CommandLine -match 'shiptrack' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo [ShipTrack] Done.
endlocal
