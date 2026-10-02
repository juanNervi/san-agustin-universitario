-- Ya no usamos el flag booleano: la pertenencia va por plantel_jugadores.
alter table public.jugadores
  drop column if exists en_plantel_corriente;
