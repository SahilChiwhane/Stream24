@echo off
rem Industrial Port Cleanup for Stream24 (Windows only)
rem Silent and robust.

set PORT=%~1
if "%PORT%"=="" set PORT=5051

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  if not "%%a"=="0" if not "%%a"=="-" (
    taskkill /F /PID %%a /T >nul 2>&1
  )
)
exit /b 0
