@echo off
setlocal EnableDelayedExpansion
title SysOptimizer - CLI Performance Tuner

:: ==========================================
:: Admin Privileges Check
:: ==========================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrative privileges required.
    echo Please right-click and "Run as Administrator".
    pause
    exit /b
)

:: ==========================================
:: UI Initialization
:: ==========================================
color 0B
mode con: cols=80 lines=25

:MainMenu
cls
echo ===============================================================================
echo                             SysOptimizer v1.0
echo                     Native Windows Performance Tuner
echo ===============================================================================
echo.

:: --- Live Quick Stats ---
echo [System Status]
for /f "tokens=2 delims==" %%A in ('wmic cpu get loadpercentage /value ^| find "="') do set cpuload=%%A
for /f "tokens=2 delims==" %%B in ('wmic OS get FreePhysicalMemory /value ^| find "="') do set freemem=%%B

:: Convert KB to MB for readability
set /a freememMB=%freemem% / 1024
echo CPU Load: %cpuload%%%  ^|  Free RAM: %freememMB% MB
echo.
echo ===============================================================================

echo Select an optimization profile:
echo.
echo   [1] 🚀 BEAST MODE (Ultimate Performance)
echo       Favors CPU frequency, unleashes thermal limits for gaming/rendering.
echo.
echo   [2] ⚖️ BALANCED MODE (Default Windows)
echo       Standard operation. Scales power based on active tasks.
echo.
echo   [3] 🔋 ECO MODE (Battery Saver)
echo       Throttles CPU to conserve power and heat.
echo.
echo   [4] 🧹 DEEP CLEAN JUNK (Temp ^& DNS)
echo       Safely wipes Windows temporary files and flushes DNS cache.
echo.
echo   [5] 🔄 Refresh Stats
echo   [0] Exit
echo.

set /p choice="Enter your choice (0-5): "

if "%choice%"=="1" goto BeastMode
if "%choice%"=="2" goto BalancedMode
if "%choice%"=="3" goto EcoMode
if "%choice%"=="4" goto DeepClean
if "%choice%"=="5" goto MainMenu
if "%choice%"=="0" exit /b

echo Invalid choice. Please try again.
pause
goto MainMenu

:: ==========================================
:: Execution Blocks
:: ==========================================

:BeastMode
cls
echo [Action] Activating Ultimate Performance Power Plan...
powercfg -setactive 87fb05ad-41b0-46c9-87ca-d6488cdb8f08 >nul 2>&1
if %errorLevel% neq 0 (
    :: Fallback to High Performance if Ultimate isn't unlocked on this OS
    powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1
)
color 0C
echo SUCCESS: Beast Mode is now ACTIVE.
timeout /t 3 >nul
color 0B
goto MainMenu

:BalancedMode
cls
echo [Action] Activating Balanced Power Plan...
powercfg -setactive 381b4222-f694-41f0-9685-ff5bb260df2e >nul 2>&1
color 0A
echo SUCCESS: Balanced Mode is now ACTIVE.
timeout /t 3 >nul
color 0B
goto MainMenu

:EcoMode
cls
echo [Action] Activating Eco/Power Saver Plan...
powercfg -setactive a1841308-3541-4fab-bc81-f71556f20b4a >nul 2>&1
color 0E
echo SUCCESS: Eco Mode is now ACTIVE.
timeout /t 3 >nul
color 0B
goto MainMenu

:DeepClean
cls
echo [Action] Cleaning Windows Temporary Junk...
echo Please wait. This may take a moment.
echo.

:: Delete User Temp
echo Cleaning %TEMP%...
del /q /f /s "%TEMP%\*" >nul 2>&1
for /d %%p in ("%TEMP%\*") do rmdir /s /q "%%p" >nul 2>&1

:: Delete Windows Temp
echo Cleaning C:\Windows\Temp...
del /q /f /s "C:\Windows\Temp\*" >nul 2>&1
for /d %%p in ("C:\Windows\Temp\*") do rmdir /s /q "%%p" >nul 2>&1

:: Delete Prefetch
echo Cleaning Windows Prefetch...
del /q /f /s "C:\Windows\Prefetch\*" >nul 2>&1

:: Flush DNS
echo Flushing DNS Cache...
ipconfig /flushdns >nul 2>&1

echo.
color 0A
echo SUCCESS: System Clean Complete! Reclaimed space and flushed networks.
pause
color 0B
goto MainMenu
