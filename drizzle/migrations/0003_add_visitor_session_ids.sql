ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS visitor_id text;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS session_id text;