"use client";

import { signOut } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function UserNav() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ description: "Has cerrado sesión." });
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        variant: "destructive",
        title: "Fallo al Cerrar Sesión",
        description: "Ocurrió un error al cerrar sesión.",
      });
    }
  };

  if (!user) {
    return (
      <div className="hidden items-center gap-4 md:flex">
         <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
         <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  const userAvatar = PlaceHolderImages.find(p => p.id === "user-avatar");

  return (
    <div className="hidden items-center gap-4 md:flex">
      <ThemeToggle />
      <div className="text-right">
        <p className="text-sm font-medium">{user.displayName || user.email}</p>
        <p className="text-xs text-muted-foreground">Usuario</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {userAvatar && <AvatarImage src={user.photoURL || userAvatar.imageUrl} alt={user.displayName || "Avatar de usuario"} />}
              <AvatarFallback>
                {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName || "Usuario"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* Se pueden añadir futuros elementos aquí */}
          </DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
