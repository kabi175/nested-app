"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Users as UsersIcon, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Sparkles,
  Filter,
  Download,
  UserPlus
} from 'lucide-react';
import { getUsers, User } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers('ALL');
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.kycStatus === "approved").length,
    kycApproved: users.filter(u => u.kycStatus === "approved").length,
    pendingKyc: users.filter(u => u.kycStatus === "pending").length,
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20">
                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Manage and monitor user accounts with precision
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
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-2">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total Users</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-semibold">+12%</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">from last month</span>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Active Users</CardTitle>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Active</Badge>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">KYC approved</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">KYC Approved</CardTitle>
                <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800">Verified</Badge>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.kycApproved}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">85% approval rate</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Pending KYC</CardTitle>
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">Pending</Badge>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.pendingKyc}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Awaiting review</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20">
                  <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20">
                    <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Users ({filteredUsers.length})
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
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">User</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Contact</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Funds</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Goals</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Joined</TableHead>
                      <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <LoadingSkeleton />
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <UsersIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-red-600 dark:text-red-400 font-medium">Error loading users</p>
                              <p className="text-slate-500 dark:text-slate-500 text-sm">{error}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <UsersIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-slate-600 dark:text-slate-400 font-medium">No users found</p>
                              <p className="text-slate-500 dark:text-slate-500 text-sm">Try adjusting your search criteria</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <motion.tr 
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-200/50 dark:border-slate-700/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">ID: {user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">{user.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">{user.phone || 'N/A'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">${user.totalFunds?.toLocaleString() || '0'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              {user.activeGoals || 0} active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                user.kycStatus === "approved" 
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : user.kycStatus === "pending"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                              }
                            >
                              {user.kycStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Calendar className="h-3 w-3" />
                              {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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