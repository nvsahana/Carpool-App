#!/bin/bash

# Simple start script - use this after initial setup

echo "🚀 Starting Carpool App..."

# Start backend
cd backend
source .venv/bin/activate
uvicorn app:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Prisma Studio
cd backend
npx prisma@5.17.0 studio &
STUDIO_PID=$!
cd ..

# Wait a moment for Prisma Studio to start
sleep 2

# Start frontend
cd carpool-app
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application Running!"
echo "Backend:       http://127.0.0.1:8000"
echo "Frontend:      http://localhost:3000"
echo "Prisma Studio: http://localhost:5555"
echo ""
echo "Press Ctrl+C to stop"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID $STUDIO_PID 2>/dev/null; pkill -f 'uvicorn app:app' 2>/dev/null; pkill -f 'react-scripts start' 2>/dev/null; pkill -f 'prisma studio' 2>/dev/null; echo 'Stopped!'" EXIT INT TERM

# Wait
wait
