#!/bin/bash
# Quick script to restart services

echo "Restarting WIMPG services..."
docker compose restart

echo "Services restarted. Checking health..."
sleep 5
docker compose ps
