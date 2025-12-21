#!/bin/bash
# Post-start script - runs every time the container starts

echo "🔄 Starting SimpleAccounts-UAE development environment..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h localhost -p 5432 -U simpleaccounts -q; do
    sleep 1
done
echo "✅ PostgreSQL is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until redis-cli -h localhost ping > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Redis is ready"

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "Database connection:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  User: simpleaccounts"
echo "  Pass: simpleaccounts_dev"
echo "  DB:   simpleaccounts"
echo ""
echo "Redis connection:"
echo "  Host: localhost"
echo "  Port: 6379"
