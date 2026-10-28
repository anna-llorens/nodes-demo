CREATE TABLE public.analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('page_view','node_click')),
  path text,
  node_id text,
  node_name text,
  device text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX analytics_events_created_idx ON public.analytics_events (created_at DESC);