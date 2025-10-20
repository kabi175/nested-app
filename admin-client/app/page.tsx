"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  GraduationCap, 
  Package, 
  TrendingUp, 
  Sparkles,
  UserCheck,
  ShieldCheck,
  Layers,
  Target
} from 'lucide-react';
import { getUsers, getBaskets, getEducation, getActiveFunds } from '@/lib/api';

interface DashboardStats {
  // Top level stats
  totalUsers: number;
  totalBaskets: number;
  totalEducation: number;
  totalFunds: number;
  
  // User breakdown
  regularUsers: number;
  investors: number;
  admins: number;
  
  // Basket insights
  uniqueFundsUsed: number;
  avgFundsPerBasket: number;
  avgBasketDuration: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [usersResponse, basketsResponse, educationResponse, funds] = await Promise.all([
          getUsers('ALL', { page: 0, size: 1000 }), // Get all users
          getBaskets({ page: 0, size: 1000 }), // Get all baskets
          getEducation({ page: 0, size: 1000 }), // Get all education records
          getActiveFunds(), // Get all active funds
        ]);

        const { users } = usersResponse;
        const { baskets } = basketsResponse;
        const { education } = educationResponse;

        // Calculate user stats
        const investors = users.filter(u => u.investor).length;
        const admins = users.filter(u => u.role === 'ADMIN').length;
        const regularUsers = users.filter(u => !u.investor && u.role !== 'ADMIN').length;

        // Calculate basket insights
        const uniqueFundsSet = new Set<string>();
        let totalFundsInBaskets = 0;
        let totalYears = 0;
        let basketsWithYears = 0;

        baskets.forEach(basket => {
          if (basket.funds && basket.funds.length > 0) {
            basket.funds.forEach(f => {
              if (f.fundId) {
                uniqueFundsSet.add(f.fundId);
              }
            });
            totalFundsInBaskets += basket.funds.length;
          }
          if (basket.duration) {
            totalYears += basket.duration;
            basketsWithYears++;
          }
        });

        const avgFundsPerBasket = baskets.length > 0 
          ? Math.round((totalFundsInBaskets / baskets.length) * 10) / 10 
          : 0;
        
        const avgBasketDuration = basketsWithYears > 0 
          ? Math.round((totalYears / basketsWithYears) * 10) / 10 
          : 0;

        setStats({
          totalUsers: users.length,
          totalBaskets: baskets.length,
          totalEducation: education.length,
          totalFunds: funds.length,
          regularUsers,
          investors,
          admins,
          uniqueFundsUsed: uniqueFundsSet.size,
          avgFundsPerBasket,
          avgBasketDuration,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const topStatCards = stats ? [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      gradient: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20',
      borderColor: 'border-blue-200/50 dark:border-blue-800/30',
      description: 'Registered users'
    },
    { 
      title: 'Total Baskets', 
      value: stats.totalBaskets, 
      icon: Package, 
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      bgGradient: 'bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20',
      borderColor: 'border-violet-200/50 dark:border-violet-800/30',
      description: 'Investment baskets'
    },
    { 
      title: 'Education Records', 
      value: stats.totalEducation, 
      icon: GraduationCap, 
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
      description: 'Education entries'
    },
    { 
      title: 'Available Funds', 
      value: stats.totalFunds, 
      icon: TrendingUp, 
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20',
      borderColor: 'border-amber-200/50 dark:border-amber-800/30',
      description: 'Total active funds'
    },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50">
        <div className="space-y-8 p-6">
          <div className="space-y-2">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50">
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Real-time admin analytics
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {topStatCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card 
                className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm ${stat.bgGradient} border ${stat.borderColor}`}
              >
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  User Analytics
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Regular</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.regularUsers || 0}</div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Investors</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.investors || 0}</div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Admins</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.admins || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Investment Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 dark:border-purple-800/20">
                    <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Investment Overview
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Unique Funds Used</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.uniqueFundsUsed || 0}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg Funds per Basket</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.avgFundsPerBasket || 0}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg Basket Duration</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.avgBasketDuration || 0} yrs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}