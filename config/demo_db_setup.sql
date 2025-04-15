BEGIN;

DROP TABLE IF EXISTS mupp_setup_demo CASCADE;
CREATE TABLE mupp_setup_demo(
  id SERIAL,
  name VARCHAR
);

DROP TABLE IF EXISTS accounts CASCADE;
CREATE TABLE accounts(
  id SERIAL PRIMARY KEY,
  username VARCHAR,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  salt VARCHAR NOT NULL
);

DROP TABLE IF EXISTS logins CASCADE;
CREATE TABLE logins(
  id SERIAL,
  user_id VARCHAR,
  session_key VARCHAR UNIQUE NOT NULL
);

DROP SCHEMA IF EXISTS forms CASCADE;
CREATE SCHEMA forms;

DROP TABLE IF EXISTS hosted_forms;
CREATE TABLE hosted_forms(
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  form_structure VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);

INSERT INTO mupp_setup_demo (name) VALUES ('test1'), ('test2'), ('test3');

COMMIT;