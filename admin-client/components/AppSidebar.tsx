"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Next.js hook to get current path
import { LayoutDashboard, Users, GraduationCap, Package, BarChart3, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Users", url: "/users", icon: Users },
  { title: "Education", url: "/education", icon: GraduationCap },
  { title: "Baskets", url: "/baskets", icon: Package },
];

export function AppSidebar() {
  const pathname = usePathname(); // Next.js way to get current route
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold text-sidebar-foreground">Admin Portal</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          {user && (
            <div className="flex items-center gap-2 px-2 py-1 text-sm text-sidebar-foreground/70">
              <User className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
