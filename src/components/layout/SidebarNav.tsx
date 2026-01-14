"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Users, DatabaseZap, BarChartBig, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/stats", label: "Estadísticas", icon: BarChartBig },
  { href: "/data-tools", label: "Herramientas", icon: DatabaseZap },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href) && (item.href === "/" ? pathname === "/" : true);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? "default" : "ghost" }),
              "justify-start",
              !isActive && "text-muted-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
