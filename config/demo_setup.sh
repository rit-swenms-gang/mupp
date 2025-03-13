echo "Testing env vars: $POSTGRES_HOST"
createdb -h $POSTGRES_HOST -U $POSTGRES_USER -w mupp
psql -d mupp -U $POSTGRES_USER -f config/demo_db_setup.sql
echo "database: mupp
host: $POSTGRES_HOST
user: $POSTGRES_USER
password: $POSTGRES_PASSWORD
port: 5432" >> config/db.yml
