'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Pages that should not show the sidebar
  const publicPages = ['/login', '/unauthorized'];
  const isPublicPage = publicPages.includes(pathname);
  
  // Show loading skeleton while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  
  // If user is authenticated and not on a public page, show sidebar
  if (user && !isPublicPage) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </SidebarProvider>
    );
  }
  
  // For public pages or when not authenticated, show without sidebar
  return <>{children}</>;
}

