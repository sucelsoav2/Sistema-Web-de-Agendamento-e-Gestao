create table if not exists public.google_calendar_tokens (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  access_token text,
  refresh_token text,
  scope text,
  token_type text,
  expiry_date bigint,
  google_email text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
