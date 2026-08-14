@echo off
setlocal
cd /d "%~dp0"

echo [ShipTrack] Checking port 8080...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo [ShipTrack] Killing stale process %%p holding port 8080...
    taskkill /F /T /PID %%p >nul 2>&1
)

echo [ShipTrack] Cleaning up leftover ShipTrack Java processes...
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name = 'java.exe'\" | Where-Object { $_.CommandLine -match 'shiptrack' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo [ShipTrack] Waiting for port 8080 to be free...
set /a tries=0
:waitloop
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    set /a tries+=1
    if %tries% geq 15 (
        echo [ShipTrack] ERROR: Port 8080 is still in use. Aborting.
        exit /b 1
    )
    timeout /t 1 /nobreak >nul
    goto waitloop
)

echo [ShipTrack] Starting backend...
call mvnw.cmd spring-boot:run
endlocal
