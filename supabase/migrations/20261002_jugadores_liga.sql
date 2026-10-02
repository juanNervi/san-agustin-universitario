-- Ampliar jugadores con campos de la ficha de Liga Universitaria.
-- Mapeo:
--   Carné              → numero_liga (ya existía)
--   Documento          → cedula (ya existía)
--   Apellidos/Nombres  → nombre (ya existía)
--   Sexo               → sexo
--   F. Fichaje         → fecha_fichaje
--   Calidad            → calidad
--   Instituto          → instituto
--   Carrera            → carrera
--   Edad               → (no se guarda; se deriva de fecha_nacimiento)
--   F. Nacim.          → fecha_nacimiento (ya existía)
--   F. Ingreso         → fecha_ingreso
--   F. Últ. Ex/Rec     → fecha_ultimo_examen
--   F. Venc. F.M       → vencimiento_ficha_medica (ya existía)
--   F. Venc. Carr      → vencimiento_carnet (ya existía)

alter table public.jugadores
  add column if not exists sexo text,
  add column if not exists fecha_fichaje date,
  add column if not exists calidad text,
  add column if not exists instituto text,
  add column if not exists carrera text,
  add column if not exists fecha_ingreso date,
  add column if not exists fecha_ultimo_examen date;

comment on column public.jugadores.sexo is 'Sexo según ficha de liga (M/F)';
comment on column public.jugadores.fecha_fichaje is 'Fecha de fichaje en la liga';
comment on column public.jugadores.calidad is 'Calidad del jugador (p. ej. Estudiante)';
comment on column public.jugadores.instituto is 'Instituto / universidad';
comment on column public.jugadores.carrera is 'Carrera universitaria';
comment on column public.jugadores.fecha_ingreso is 'Fecha de ingreso a la institución';
comment on column public.jugadores.fecha_ultimo_examen is 'Fecha del último examen / reconocimiento médico';
