BEGIN;

DROP TABLE IF EXISTS accounts CASCADE;
CREATE TABLE accounts(
  id SERIAL,
  username VARCHAR,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL
);

DROP TABLE IF EXISTS mupp_setup_demo CASCADE;
CREATE TABLE mupp_setup_demo(
  id SERIAL,
  name VARCHAR
);

INSERT INTO mupp_setup_demo (name) VALUES ('test1'), ('test2'), ('test3');
-- INSERT INTO accounts (name, password) VALUES ('test', 'dummy'), ('acount1', 'password');

COMMIT;