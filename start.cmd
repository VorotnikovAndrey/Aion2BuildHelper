@echo off
rem Aion2 Build Helper: запуск в режиме разработки (горячая перезагрузка).
rem Сам найдёт Node.js и при первом запуске поставит зависимости.
chcp 65001 >nul
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 set "PATH=C:\Program Files\nodejs;%PATH%"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Install LTS from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo First run: installing dependencies...
  call npm install
  if errorlevel 1 ( pause & exit /b 1 )
)

call npm run dev
if errorlevel 1 pause
