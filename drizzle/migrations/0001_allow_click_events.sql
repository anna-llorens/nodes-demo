ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_kind_check;
ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_kind_check CHECK (kind IN ('page_view','node_click','click'));
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS label text;