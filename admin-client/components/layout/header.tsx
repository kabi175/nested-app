"use client";

import { Button } from "@/components/ui/button";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>
      </div>
    </div>
  );
}