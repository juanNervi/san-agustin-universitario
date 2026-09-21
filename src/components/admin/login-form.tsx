"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [error, setError] = useState(initialError ?? null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        setError(authError?.message ?? "No se pudo iniciar sesión.");
        setPending(false);
        return;
      }

      const persist = await fetch("/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });

      if (!persist.ok) {
        const payload = (await persist.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? "El login funcionó, pero no se guardó la sesión.");
        setPending(false);
        return;
      }

      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red al entrar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4">
      {error ? (
        <p className="border border-white/40 px-3 py-2 text-sm">{error}</p>
      ) : null}
      <label className="block text-xs uppercase tracking-[0.18em] text-white/60">
        Mail
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-2 w-full border border-white/30 bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white"
        />
      </label>
      <label className="block text-xs uppercase tracking-[0.18em] text-white/60">
        Contraseña
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full border border-white/30 bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-white bg-white px-4 py-3 text-[0.7rem] uppercase tracking-[0.22em] text-bordo disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
