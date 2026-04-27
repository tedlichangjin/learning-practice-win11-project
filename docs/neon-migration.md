# Neon Migration

1. Create a Neon project and copy the connection string.
2. Set `NEON_DATABASE_URL` in `.env.local`. `DATABASE_URL` is still accepted as a fallback.
3. Apply [database-schema.sql](/d:/code/学习next.js/projects/database-schema.sql) to Neon.
4. Export data from Supabase and import it into Neon:

```bash
pg_dump --data-only --column-inserts "$SUPABASE_DB_URL" > supabase-data.sql
psql "$NEON_DATABASE_URL" -f supabase-data.sql
```

5. Verify row counts for `users`, `game_records`, and `share_posts`.
6. Run `pnpm db:push` if schema changes continue to evolve from Drizzle.
7. Start the app and smoke-test login, record saving, share pages, and leaderboard.

Recommended validation queries:

```sql
select count(*) from users;
select count(*) from game_records;
select count(*) from share_posts;
```
