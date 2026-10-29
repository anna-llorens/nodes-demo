CREATE TABLE public.contact_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 200 AND position('@' in email) > 1),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  lang text NOT NULL DEFAULT 'es' CHECK (lang IN ('es','en')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX contact_messages_created_idx ON public.contact_messages (created_at DESC);