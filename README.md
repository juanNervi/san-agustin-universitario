# San Agustín Universitario

Sitio web del club de fútbol y hockey de la Liga Universitaria de Deportes (Uruguay).

## Stack

- Next.js + TypeScript + Tailwind
- Deploy previsto en Vercel
- Base de datos en Supabase (panel de delegados)

## Desarrollo

```bash
npm install
npm run dev
```

- Landing: `/`
- Panel de delegados: `/admin/login`

## Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutá `supabase/migrations/20260911_init.sql`.
3. Copiá `.env.example` a `.env.local` y pegá la URL y la `anon` key (Settings → API).
4. En **Authentication → Users**, creá un usuario con mail y contraseña.
5. En SQL Editor, hacelo delegado:

```sql
update public.profiles
set role = 'delegado'
where email = 'tu-mail@dominio.com';
```

La contraseña la guarda Auth de Supabase. En `profiles` quedan usuario, mail y rol (`delegado` o `jugador`).

## Identidad

- Camiseta: bordó
- Letras: blanco
