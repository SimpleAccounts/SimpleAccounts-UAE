#!/bin/bash

# Set your database connection details
DB_HOST=db
DB_PORT=5432
DB_USER=simpleaccounts_user
DB_PASSWORD=SimpleAccounts@2023
DB_NAME=simpleaccounts_db

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -c "SELECT 1" >/dev/null 2>&1; do
    echo "Database is not ready yet. Retrying in 2 seconds..."
    sleep 2
done

echo "Database is now ready! Starting the application..."
exec "$@"
