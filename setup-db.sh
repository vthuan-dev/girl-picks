#!/bin/bash
echo "=== Setting up PostgreSQL ==="

# Create user
sudo -u postgres psql -c "CREATE USER girlpick WITH PASSWORD 'girlpick123';" 2>&1 | grep -v "already exists" || echo "User may already exist"

# Create database
sudo -u postgres psql -c "CREATE DATABASE girlpick OWNER girlpick;" 2>&1 | grep -v "already exists" || echo "Database may already exist"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE girlpick TO girlpick;"

echo "=== Database setup complete ==="
echo "Database: girlpick"
echo "User: girlpick"
echo "Password: girlpick123"

