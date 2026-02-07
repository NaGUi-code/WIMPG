#!/bin/bash
# Quick script to stop all services

echo "Stopping WIMPG services..."
docker compose down

echo "Services stopped."
