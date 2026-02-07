#!/bin/bash
# Quick script to view logs

echo "=== Backend Logs ==="
docker compose logs -f --tail=100 backend frontend
