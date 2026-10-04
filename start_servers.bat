@echo off
echo ===================================================
echo   PRATIBIMB - AI Digital Twin & Operating Layer
echo ===================================================
echo.
echo Starting Pratibimb Backend (FastAPI on Port 8000)...
start "Pratibimb Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Pratibimb Frontend (Vite on Port 5173)...
start "Pratibimb Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Pratibimb is running!
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ===================================================
