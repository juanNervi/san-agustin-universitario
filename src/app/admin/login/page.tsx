import { ClubMark } from "@/components/club-mark";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-16">
      <ClubMark className="mx-auto h-20 w-auto" decorative />
      <h1 className="mt-8 text-center font-display text-4xl tracking-[0.1em]">
        Delegados
      </h1>
      <p className="mt-3 text-center text-sm text-white/70">
        Entrá con mail y contraseña para ver jugadores y planteles.
      </p>

      {!configured ? (
        <p className="mt-8 border border-white/30 p-4 text-sm text-white/80">
          Falta configurar Supabase en el archivo <code>.env.local</code>.
        </p>
      ) : (
        <LoginForm initialError={error} />
      )}
    </main>
  );
}
