-- Contact form messages (POST /api/contact). Read them with:
-- wrangler d1 execute nodes-contact --remote --command "select * from contact_messages order by id desc limit 20"
CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  interest TEXT NOT NULL,
  message TEXT NOT NULL,
  locale TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'site'
);
