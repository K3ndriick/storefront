import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data : { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();


  if (profile?.role !== "admin") {
    redirect("/");
  }


return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Page heading */}
        <h1 className="text-3xl font-bold mb-8">Admin Account</h1>

        {/* Two-column layout: sidebar left, content right */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar - pass the fetched name as a prop */}
          <AdminSidebar
            userName={profile?.full_name ?? null}
          />

          {/* Main content area - renders the active dashboard page */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}