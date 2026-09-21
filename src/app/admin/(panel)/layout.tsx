import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("La sesión no quedó guardada. Probá entrar de nuevo."),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "delegado") {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent(
          "Entraste, pero esta cuenta no es delegado. En SQL: update profiles set role = 'delegado' where email = 'admin@gmail.com';",
        ),
    );
  }

  return <AdminShell username={profile.username}>{children}</AdminShell>;
}
