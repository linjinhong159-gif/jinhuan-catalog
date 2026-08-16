@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Use the GitHub Codespaces option in this repository, or install Node.js first.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing Silex V3...
  call npm install
  if errorlevel 1 pause
)
echo Starting Silex V3 at http://localhost:6805
call npm start
pause
