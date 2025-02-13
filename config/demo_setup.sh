createdb -h localhost -U cashley mupp
psql -d mupp -U cashley -f config/demo_db_setup.sql
echo "database: mupp
host: localhost
user: postgres
password: does_not_matter
port: 5432" >> config/db.yml
