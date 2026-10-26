# Database migrations

The application never changes the database schema during startup. Apply the
SQL migrations before starting an application version that depends on them.

From the repository root:

```sh
make migrate
```

The Go migration runner embeds the numbered SQL files and records applied
versions in `schema_migrations`. Migrations are idempotent and stop on the
first SQL error. `backend/.env.local` is loaded before `backend/.env`; existing
shell environment variables take precedence. Confirm the command succeeds
before starting the new backend version.
