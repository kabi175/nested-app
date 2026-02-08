"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Action {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Zap;
  color: string;
}

const actions: Action[] = [
  {
    id: 'refresh-portfolio',
    title: 'Force Refresh User Portfolio',
    description: 'Trigger a manual refresh of a user\'s portfolio data. This action will force the system to recalculate and update the user\'s portfolio information.',
    href: '/actions/refresh-portfolio',
    icon: RefreshCw,
    color: 'from-blue-500 to-indigo-500',
  },
];

export default function ActionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50">
      <div className="space-y-8 p-6">
        {/* Modern Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  Admin Actions
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Trigger administrative actions and system operations
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                        <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <Link href={action.href}>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                      >
                        <span>Execute Action</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                About Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Admin actions allow you to trigger system operations and administrative tasks. 
                Each action is designed to perform a specific function that may require manual intervention. 
                Please review the action details before executing to ensure you understand the impact.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
