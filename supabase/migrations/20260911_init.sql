-- San Agustín Universitario — esquema inicial
-- Correr en el SQL Editor de Supabase (o via CLI).

create type public.user_role as enum ('delegado', 'jugador');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  email text not null,
  role public.user_role not null default 'jugador',
  created_at timestamptz not null default now()
);

create table public.planteles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null,
  anio integer not null,
  created_at timestamptz not null default now()
);

create table public.jugadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cedula text not null unique,
  numero_liga text,
  fecha_nacimiento date,
  email text,
  vencimiento_carnet date,
  vencimiento_ficha_medica date,
  en_plantel_corriente boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.plantel_jugadores (
  plantel_id uuid not null references public.planteles (id) on delete cascade,
  jugador_id uuid not null references public.jugadores (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plantel_id, jugador_id)
);

create index planteles_anio_idx on public.planteles (anio desc);
create index jugadores_nombre_idx on public.jugadores (nombre);
create index jugadores_carnet_idx on public.jugadores (vencimiento_carnet);
create index jugadores_ficha_idx on public.jugadores (vencimiento_ficha_medica);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'jugador')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.planteles enable row level security;
alter table public.jugadores enable row level security;
alter table public.plantel_jugadores enable row level security;

create or replace function public.is_delegado()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'delegado'
  );
$$;

create policy "own profile read"
  on public.profiles for select
  using (id = auth.uid() or public.is_delegado());

create policy "delegados manage profiles"
  on public.profiles for all
  using (public.is_delegado())
  with check (public.is_delegado());

create policy "delegados manage planteles"
  on public.planteles for all
  using (public.is_delegado())
  with check (public.is_delegado());

create policy "delegados manage jugadores"
  on public.jugadores for all
  using (public.is_delegado())
  with check (public.is_delegado());

create policy "delegados manage plantel_jugadores"
  on public.plantel_jugadores for all
  using (public.is_delegado())
  with check (public.is_delegado());

insert into public.planteles (nombre, categoria, anio) values
  ('Mayores 2026', 'mayores', 2026),
  ('Reserva 2026', 'reserva', 2026),
  ('Sub 20 2026', 'sub-20', 2026),
  ('Sub 18 2026', 'sub-18', 2026),
  ('Hockey femenino 2026', 'hockey-femenino', 2026);

-- Después de crear el primer usuario en Authentication > Users:
-- update public.profiles set role = 'delegado' where email = 'tu-mail@dominio.com';
