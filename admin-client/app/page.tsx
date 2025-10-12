"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  GraduationCap, 
  Package, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Sparkles,
  TrendingDown,
  Eye,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalColleges: 45,
    totalBaskets: 78,
    totalFunds: 12000000,
  });

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      gradient: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20',
      borderColor: 'border-blue-200/50 dark:border-blue-800/30',
      change: '+12.5%',
      trend: 'up' as const
    },
    { 
      title: 'Colleges', 
      value: stats.totalColleges, 
      icon: GraduationCap, 
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
      change: '+8.2%',
      trend: 'up' as const
    },
    { 
      title: 'Baskets', 
      value: stats.totalBaskets, 
      icon: Package, 
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      bgGradient: 'bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20',
      borderColor: 'border-violet-200/50 dark:border-violet-800/30',
      change: '+15.8%',
      trend: 'up' as const
    },
    { 
      title: 'Available Funds', 
      value: stats.totalFunds, 
      icon: TrendingUp, 
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20',
      borderColor: 'border-amber-200/50 dark:border-amber-800/30',
      change: '+22.1%',
      trend: 'up' as const
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user",
      description: "New user registered: Sarah Johnson",
      time: "2 minutes ago",
      icon: Users,
      iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    },
    {
      id: 2,
      type: "college",
      description: "MIT college details updated",
      time: "15 minutes ago",
      icon: GraduationCap,
      iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: 3,
      type: "basket",
      description: "Conservative Portfolio allocation changed",
      time: "1 hour ago",
      icon: Package,
      iconBg: "bg-violet-500/20 text-violet-600 dark:text-violet-400",
    },
    {
      id: 4,
      type: "system",
      description: "System backup completed successfully",
      time: "2 hours ago",
      icon: Zap,
      iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    },
  ];

  const quickStats = [
    {
      title: "KYC Verification",
      value: 85,
      progress: 85,
      color: "bg-green-500",
      description: "Users with approved KYC",
    },
    {
      title: "Basket Utilization",
      value: 70,
      progress: 70,
      color: "bg-blue-500",
      description: "Active investment baskets",
    },
    {
      title: "Platform Health",
      value: 98,
      progress: 98,
      color: "bg-purple-500",
      description: "Overall system uptime",
    },
    {
      title: "New Signups (30D)",
      value: 250,
      progress: 60,
      color: "bg-orange-500",
      description: "New users this month",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50">
      <div className="space-y-8 p-6">
        {/* Modern Header with Glassmorphism */}
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
                  Welcome to your premium admin portal
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
              Live Data
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-200 rounded-xl px-4 py-2"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 days
            </Button>
          </div>
        </motion.div>

        {/* Premium Stats Grid with Glassmorphism */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card 
                className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm ${stat.bgGradient} border ${stat.borderColor}`}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-3">
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      stat.trend === "up" 
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" 
                        : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                    }`}>
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span className="font-semibold">{stat.change}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50"
                  >
                    <div className={`p-3 rounded-xl ${activity.iconBg} group-hover:scale-105 transition-transform duration-200`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 dark:border-purple-800/20">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Performance
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {quickStats.map((stat, index) => (
                  <motion.div 
                    key={stat.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stat.title}</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{stat.value}%</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={stat.progress} 
                        className="h-3 rounded-full bg-slate-200/50 dark:bg-slate-700/50" 
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.description}</p>
                  </motion.div>
                ))}
                
                <Separator className="my-6 bg-slate-200/50 dark:bg-slate-700/50" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200/30 dark:border-emerald-800/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Health</span>
                    </div>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                      Excellent
                    </Badge>
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