import { ReactNode } from "react";
import SideNavigation from "@/components/common/navigation/SideNavigation";
import { Toaster } from "@/components/ui/sonner";
// Supabase Server Client
import { createServerSideClient } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SideNavigation user={user} />
      <div>{children}</div>
      <Toaster />
    </>
  );
}
