echo "Testing env vars: $POSTGRES_HOST"
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -d mupp -U $POSTGRES_USER -f config/demo_db_setup.sql
echo "database: mupp
host: $POSTGRES_HOST
user: $POSTGRES_USER
password: $POSTGRES_PASSWORD
port: $POSTGRES_PORT" > config/db.yml
echo "DB_SCHEMA='test'" > .env
