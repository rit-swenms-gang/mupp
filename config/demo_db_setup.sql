BEGIN;

CREATE TABLE mupp_setup_demo(
  id SERIAL,
  name VARCHAR
);

INSERT INTO mupp_setup_demo (name) VALUES ('test1'), ('test2'), ('test3');

COMMIT;