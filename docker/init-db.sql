-- Runs once on first boot of the postgres container (docker-entrypoint-initdb.d).
-- The `invitara` database is created by POSTGRES_DB; Webstudio needs its own.
SELECT 'CREATE DATABASE webstudio'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'webstudio')\gexec
