-- Research article hearts and comments (ADR 0012, docs/comments.md). Rows are keyed by the
-- article's frontmatter `card`, shared by its ES and EN versions. Comments are published at once;
-- moderation is deleting rows:
-- wrangler d1 execute nodes-contact --remote --command "DELETE FROM comments WHERE id = ?"
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_key TEXT NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- SHA-256 of IP + IP_SALT; the raw IP is never stored.
  ip_hash TEXT NOT NULL
);
CREATE INDEX comments_article_created ON comments (article_key, created_at);

CREATE TABLE reactions (
  article_key TEXT PRIMARY KEY,
  hearts INTEGER NOT NULL DEFAULT 0
);

-- Rate limiting (heart: once per article per 24 h; comment: 3 per hour). The Worker deletes rows
-- older than 7 days on every write.
CREATE TABLE rate_log (
  ip_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX rate_log_ip_action_created ON rate_log (ip_hash, action, created_at);
