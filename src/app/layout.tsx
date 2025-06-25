
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/AppLogo";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { LayoutDashboard, Edit3Icon, SettingsIcon } from "lucide-react";
import { AuthProvider } from "@/hooks/useAuth"; // Import AuthProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoTube AI",
  description: "AI-powered YouTube content creation and scheduling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider> {/* Wrap with AuthProvider */}
          <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" className="border-r">
              <SidebarHeader className="p-4">
                <Link href="/" className="flex items-center gap-2">
                  <AppLogo />
                </Link>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip={{ children: "Dashboard" }}
                    >
                      <Link href="/">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    {/* This link is dynamic, so it's hard to make active. For now, no direct link. 
                        Users will navigate to review pages from the dashboard. */}
                    <SidebarMenuButton
                      asChild
                      tooltip={{ children: "Content Review (Example)" }}
                      disabled // Disabled as it's a placeholder concept in sidebar
                    >
                      {/* This is an example, actual navigation to review is via project list */}
                      <span className="cursor-not-allowed">
                        <Edit3Icon />
                        <span>Review Content</span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip={{ children: "Settings" }}
                    >
                      <Link href="/settings">
                        <SettingsIcon />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-4">
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} AutoTube AI
                </p>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset className="flex flex-col">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
