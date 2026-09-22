import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="brand-theme min-h-screen bg-background">
      <AdminNav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
