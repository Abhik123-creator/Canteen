@echo off
echo Starting local server for Canteen App...
echo.
echo Choose your preferred method:
echo 1. Python 3 (if you have Python installed)
echo 2. Python 2 (older Python version)
echo 3. Node.js (if you have Node.js installed)
echo 4. Manual instructions
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Starting Python 3 server...
    python -m http.server 8000
    goto :end
)

if "%choice%"=="2" (
    echo Starting Python 2 server...
    python -m SimpleHTTPServer 8000
    goto :end
)

if "%choice%"=="3" (
    echo Starting Node.js server...
    npx serve . -p 8000
    goto :end
)

if "%choice%"=="4" (
    echo Manual Instructions:
    echo.
    echo Option A - Python 3:
    echo   python -m http.server 8000
    echo.
    echo Option B - Python 2:
    echo   python -m SimpleHTTPServer 8000
    echo.
    echo Option C - Node.js:
    echo   npx serve . -p 8000
    echo.
    echo Option D - VS Code Live Server:
    echo   1. Install Live Server extension in VS Code
    echo   2. Right-click index.html
    echo   3. Select "Open with Live Server"
    echo.
    echo Then open: http://localhost:8000
    pause
    goto :end
)

echo Invalid choice. Please run the script again.
pause

:end
echo.
echo Once the server starts, open your browser and go to:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server when done.
pause