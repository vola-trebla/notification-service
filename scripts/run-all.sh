#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "1. Starting PostgreSQL..."
docker compose up -d

echo "2. Waiting for DB..."
sleep 3
until pg_isready -h localhost -p 5432 -q 2>/dev/null; do
  echo "   waiting..."
  sleep 1
done

echo "3. Running migrations..."
npm run db:migrate

echo "4. Starting API server (background)..."
npm run dev &
API_PID=$!
sleep 2

echo "5. Creating subscription..."
SUB=$(curl -s -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "https://httpbin.org/post", "eventTypes": ["user.created"]}')
echo "   $SUB"

echo "6. Sending event..."
EV=$(curl -s -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"type": "user.created", "payload": {"userId": "123"}}')
echo "   $EV"

echo ""
echo "Done. API PID: $API_PID"
echo "Run 'npm run worker' in another terminal to process deliveries."
echo "Kill API: kill $API_PID"
