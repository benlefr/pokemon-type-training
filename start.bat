@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

rem Force la resolution DNS en IPv4 (evite les timeouts constates)
set NODE_OPTIONS=--dns-result-order=ipv4first

echo ============================================================
echo    Pokemon Type Training - serveur accessible sur le reseau
echo ============================================================
echo.

rem Installe les dependances si node_modules est absent
if not exist "node_modules\svelte" (
    echo [i] Dependances manquantes, installation avec pnpm...
    call pnpm install
    echo.
)

echo Ouvre l'application depuis un autre appareil du reseau via :
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    echo     http://!ip!:5173/
)
echo.
echo Sur cette machine : http://localhost:5173/
echo.
echo [ATTENTION] Si un autre appareil ne peut pas se connecter, autorise Node.js
echo     dans le pare-feu Windows (une fenetre peut s'afficher au 1er lancement).
echo.
echo Pour arreter le serveur : Ctrl+C ou ferme cette fenetre.
echo ------------------------------------------------------------
echo.

call pnpm dev:host

pause
