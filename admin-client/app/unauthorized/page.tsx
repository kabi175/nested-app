'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-200/20 dark:border-red-800/20">
                <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100">
              Access Denied
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-400">
              You don't have permission to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                This area is restricted to administrators only. If you believe this is an error, please contact your system administrator.
              </p>
            </div>
            
            <Button 
              onClick={() => logout()}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

