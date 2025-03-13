echo "Testing env vars: $POSTGRES_HOST"
createdb -h $POSTGRES_HOST -U $POSTGRES_USER --password $POSTGRES_PASSWORD mupp
psql -d mupp -U $POSTGRES_USER -f config/demo_db_setup.sql
echo "database: mupp
host: $POSTGRES_HOST
user: $POSTGRES_USER
password: $POSTGRES_PASSWORD
port: $POSTGRES_PORT" >> config/db.yml
