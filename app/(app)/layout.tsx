"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { UserNav } from "@/components/layout/UserNav";
import { Logo } from "@/components/Logo";
import { FirebaseClientProvider } from "@/firebase";

function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <Logo />
           <p className="text-muted-foreground">Cargando Filux CRM...</p>
        </div>
      </div>
    );
  }

  // Define paths that should use the padded layout
  const paddedPaths = ["/contacts"];
  const usePaddedLayout = paddedPaths.some(p => pathname.startsWith(p));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            <UserNav />
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <Header />
          <main className={`flex-1 overflow-y-auto ${usePaddedLayout ? 'p-4 md:p-6 lg:p-8' : ''}`}>
              {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
        </FirebaseClientProvider>
    )
}
