"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Filter,
  Sparkles,
  Eye,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Zap,
  Download
} from 'lucide-react';
import { getBaskets, Basket } from '@/lib/api';

interface BasketFund {
  fundId: string;
  fundName: string;
  percentage: number;
}

export default function BasketsPage() {
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch baskets from API
  useEffect(() => {
    const fetchBaskets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBaskets();
        setBaskets(data);
      } catch (err) {
        console.error('Error fetching baskets:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch baskets');
      } finally {
        setLoading(false);
      }
    };

    fetchBaskets();
  }, []);

  const stats = {
    total: baskets.length,
    totalValue: baskets.reduce((sum, b) => sum + (b.funds?.length || 0) * 10000, 0),
    avgReturn: 9.2,
    highPerformers: baskets.filter(b => (b.funds?.length || 0) > 3).length,
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  );

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
              <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/20 dark:border-violet-800/20">
                <Package className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-violet-900 to-purple-900 dark:from-slate-100 dark:via-violet-100 dark:to-purple-100 bg-clip-text text-transparent">
                  Basket Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Create and manage investment baskets with precision
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-200 rounded-xl px-4 py-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Basket
            </Button>
          </div>
        </motion.div>

        {/* Premium Stats Grid with Glassmorphism */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total Baskets</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-semibold">+15%</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">this month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total AUM</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">${(stats.totalValue / 1000000).toFixed(1)}M</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Assets under management</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200/50 dark:border-violet-800/30">
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Avg Return</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.avgReturn.toFixed(1)}%</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Annual return</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30">
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">High Performers</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.highPerformers}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">&gt;10% return</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Baskets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/20 dark:border-violet-800/20">
                    <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  Investment Baskets ({baskets.length})
                </div>
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Basket</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Category</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Duration</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Funds</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Allocation</TableHead>
                      <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <LoadingSkeleton />
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-red-600 dark:text-red-400 font-medium">Error loading baskets</p>
                              <p className="text-slate-500 dark:text-slate-500 text-sm">{error}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : baskets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <Package className="h-8 w-8 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-slate-600 dark:text-slate-400 font-medium">No baskets found</p>
                              <p className="text-slate-500 dark:text-slate-500 text-sm">Create your first investment basket</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      baskets.map((basket, index) => (
                        <motion.tr 
                          key={basket.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-200/50 dark:border-slate-700/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {basket.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{basket.name}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{basket.funds?.length || 0} funds</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                basket.category === "High Risk" 
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                  : basket.category === "Medium Risk"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              }
                            >
                              {basket.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="font-medium text-slate-900 dark:text-slate-100">{basket.duration} years</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{basket.funds?.length || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {basket.totalPercentage === 100 ? (
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`font-semibold ${basket.totalPercentage === 100 ? "text-emerald-600" : "text-red-600"}`}>
                                {basket.totalPercentage}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}