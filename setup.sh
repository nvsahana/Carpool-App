#!/bin/bash

# Carpool App Setup Script
# This script sets up and runs the entire application

set -e  # Exit on error

echo "🚀 Starting Carpool App Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if PostgreSQL is running
check_postgres() {
    if /Library/PostgreSQL/17/bin/pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ PostgreSQL is not running${NC}"
        return 1
    fi
}

# Function to start PostgreSQL
start_postgres() {
    echo "Starting PostgreSQL..."
    if [ -d "/Library/PostgreSQL/17" ]; then
        # Check if already running
        if check_postgres; then
            return 0
        fi
        
        # Try to start PostgreSQL
        sudo -u postgres /Library/PostgreSQL/17/bin/pg_ctl start -D /Library/PostgreSQL/17/data -l /Library/PostgreSQL/17/data/logfile
        sleep 2
        
        if check_postgres; then
            echo -e "${GREEN}✓ PostgreSQL started successfully${NC}"
        else
            echo -e "${RED}✗ Failed to start PostgreSQL${NC}"
            echo "Please start PostgreSQL manually"
            exit 1
        fi
    else
        echo -e "${RED}✗ PostgreSQL 17 not found at /Library/PostgreSQL/17${NC}"
        echo "Please install PostgreSQL 17 or update the path in this script"
        exit 1
    fi
}

# Function to setup database
setup_database() {
    echo "Setting up database..."
    
    # Check if carpool user exists
    USER_EXISTS=$(/Library/PostgreSQL/17/bin/psql -U sahana -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='carpool'" 2>/dev/null || echo "")
    
    if [ -z "$USER_EXISTS" ]; then
        echo "Creating carpool user..."
        /Library/PostgreSQL/17/bin/psql -U sahana postgres << EOF
CREATE USER carpool WITH PASSWORD 'carpool_pw' CREATEDB;
EOF
        echo -e "${GREEN}✓ User created${NC}"
    else
        echo -e "${GREEN}✓ User already exists${NC}"
    fi
    
    # Check if database exists
    DB_EXISTS=$(/Library/PostgreSQL/17/bin/psql -U sahana -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='carpool_db'" 2>/dev/null || echo "")
    
    if [ -z "$DB_EXISTS" ]; then
        echo "Creating carpool_db database..."
        /Library/PostgreSQL/17/bin/createdb -U sahana carpool_db
        echo -e "${GREEN}✓ Database created${NC}"
    else
        echo -e "${GREEN}✓ Database already exists${NC}"
    fi
    
    # Grant permissions
    echo "Granting permissions..."
    /Library/PostgreSQL/17/bin/psql -U sahana carpool_db << EOF
GRANT ALL ON SCHEMA public TO carpool;
ALTER DATABASE carpool_db OWNER TO carpool;
EOF
    echo -e "${GREEN}✓ Permissions granted${NC}"
}

# Function to setup backend
setup_backend() {
    echo ""
    echo "📦 Setting up Backend..."
    cd backend
    
    # Activate virtual environment
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv .venv
    fi
    
    source .venv/bin/activate
    
    # Install dependencies
    echo "Installing Python dependencies..."
    pip install -q fastapi uvicorn prisma passlib "bcrypt==4.1.3" "python-jose[cryptography]" python-multipart
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npx prisma@5.17.0 generate
    
    # Push database schema
    echo "Pushing database schema..."
    npx prisma@5.17.0 db push
    
    cd ..
    echo -e "${GREEN}✓ Backend setup complete${NC}"
}

# Function to setup frontend
setup_frontend() {
    echo ""
    echo "📦 Setting up Frontend..."
    cd carpool-app
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing Node.js dependencies..."
        npm install
    else
        echo -e "${GREEN}✓ Node modules already installed${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✓ Frontend setup complete${NC}"
}

# Function to start backend
start_backend() {
    echo ""
    echo "🚀 Starting Backend Server..."
    cd backend
    source .venv/bin/activate
    uvicorn app:app --reload --host 127.0.0.1 --port 8000 &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✓ Backend running on http://127.0.0.1:8000 (PID: $BACKEND_PID)${NC}"
}

# Function to start frontend
start_frontend() {
    echo ""
    echo "🚀 Starting Frontend Server..."
    cd carpool-app
    npm start &
    FRONTEND_PID=$!
    cd ..
    echo -e "${GREEN}✓ Frontend starting on http://localhost:3000${NC}"
}

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$STUDIO_PID" ]; then
        kill $STUDIO_PID 2>/dev/null || true
    fi
    # Kill any remaining processes
    pkill -f "uvicorn app:app" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    pkill -f "prisma studio" 2>/dev/null || true
    echo "Goodbye! 👋"
}

# Trap SIGINT and SIGTERM
trap cleanup EXIT INT TERM

# Main execution
main() {
    echo ""
    echo "════════════════════════════════════════"
    echo "   🚗 Carpool App Setup & Start"
    echo "════════════════════════════════════════"
    echo ""
    
    # Check and start PostgreSQL
    if ! check_postgres; then
        start_postgres
    fi
    
    # Setup database
    setup_database
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    echo ""
    echo "════════════════════════════════════════"
    echo "   🎉 Setup Complete!"
    echo "════════════════════════════════════════"
    echo ""
    
    # Start servers
    start_backend
    sleep 3
    
    # Start Prisma Studio
    echo ""
    echo "🗄️  Starting Prisma Studio..."
    cd backend
    npx prisma@5.17.0 studio &
    STUDIO_PID=$!
    cd ..
    echo -e "${GREEN}✓ Prisma Studio running on http://localhost:5555${NC}"
    
    sleep 2
    start_frontend
    
    echo ""
    echo "════════════════════════════════════════"
    echo "   ✅ Application Running"
    echo "════════════════════════════════════════"
    echo ""
    echo "Backend:       http://127.0.0.1:8000"
    echo "Frontend:      http://localhost:3000"
    echo "Prisma Studio: http://localhost:5555"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    echo ""
    
    # Wait for user interrupt
    wait
}

# Run main function
main
