createdb -h localhost -U postgres -w mupp
psql -d mupp -U postgres -f config/demo_db_setup.sql
echo "database: mupp
host: localhost
user: postgres
password: $POSTGRES_PASSWORD
port: 5432" >> config/db.yml
