@echo off
echo Starting Next.js Frontend...
start cmd /k "cd amazon-returns-nextjs && npm run dev"

echo Starting FastAPI Backend...
start cmd /k "cd backend && uvicorn main:app --port 8000 --reload"

echo Both servers are starting in separate windows!
