-- Marca jugadores recibidos (requisito de estudio cumplido ante la liga).
alter table public.jugadores
  add column if not exists recibido boolean not null default false;

comment on column public.jugadores.recibido is
  'Jugador recibido: el requisito de estudio está cumplido y notificado a la liga';
