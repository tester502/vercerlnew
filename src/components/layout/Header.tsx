
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { LogIn, LogOut, UserCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Content Creation Hub";
  if (pathname.startsWith("/content/")) return "Review & Schedule Content";
  if (pathname === "/settings") return "Channel Settings";
  return "AutoTube AI";
}

export function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <Link href="/">
          <AppLogo className="h-8 w-auto" />
        </Link>
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {loading ? (
          <Button variant="ghost" size="icon" disabled>
            <Loader2 className="h-5 w-5 animate-spin" />
          </Button>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                  <AvatarFallback>
                    {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : <UserCircle className="h-5 w-5"/>}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p className="font-medium">{user.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {/* Future profile page */}} disabled>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOutUser} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={signInWithGoogle} variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Login with Google
          </Button>
        )}
      </div>
    </header>
  );
}
