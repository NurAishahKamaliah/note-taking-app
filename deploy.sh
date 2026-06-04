#!/bin/bash

echo "======================================================="
echo "   AUTOMATING DEVOPS NOTE APPLICATION DEPLOYMENT       "
echo "======================================================="

# Step 1: Clean up any old running instances to prevent conflicts
echo "Stopping and removing existing containers..."
docker-compose down

# Step 2: Build and start all three services (DB, Backend, Nginx) in detached mode
echo "Rebuilding and launching the multi-container ecosystem..."
docker-compose up --build -d

# Step 3: Print out the final container status to verify success
echo ""
echo "Deployment Complete! Checking container status:"
echo "-------------------------------------------------------"
docker ps
echo "-------------------------------------------------------"
echo "Frontend Interface is live at: http://localhost:8080"
echo "Backend API Interactive Docs:  http://localhost:8000/docs"
echo "======================================================="