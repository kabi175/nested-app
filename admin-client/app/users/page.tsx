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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  UserPlus,
  X,
  ShieldCheck,
  Loader2,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUsers, User, createAdminUser } from '@/lib/api';
import { exportToCSV } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import type { PageInfo } from '@/lib/api-client';
import { Label } from '@/components/ui/label';
import {
  DialogFooter,
} from '@/components/ui/dialog';

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]); // Current page users
  const [search, setSearch] = useState('');
  const [investorStatusFilter, setInvestorStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [readyToInvestCount, setReadyToInvestCount] = useState<number>(0);

  // Create Admin User states
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirebaseUid, setAdminFirebaseUid] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Fetch users with pagination, search, and filter
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUsers('ALL', {
          page: currentPage,
          size: pageSize,
          sort: 'id',
        });
        setUsers(response.users);
        setPageInfo(response.pageInfo || null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, pageSize, search, investorStatusFilter]);

  // Fetch all users in background for accurate stats (ready to invest count)
  useEffect(() => {
    const fetchAllForStats = async () => {
      try {
        // Fetch all users in batches for stats calculation
        let allFetchedUsers: User[] = [];
        let currentPageNum = 0;
        let hasMore = true;
        const batchSize = 100;
        
        while (hasMore && currentPageNum < 50) { // Limit to 50 pages (5000 users max)
          const response = await getUsers('ALL', {
            page: currentPageNum,
            size: batchSize,
            sort: 'id',
          });
          
          allFetchedUsers = [...allFetchedUsers, ...response.users];
          
          if (response.pageInfo) {
            hasMore = currentPageNum < response.pageInfo.totalPages - 1;
            currentPageNum++;
          } else {
            hasMore = response.users.length === batchSize;
            currentPageNum++;
          }
        }
        
        // Calculate ready to invest count
        // User is ready to invest if:
        // 1. isReadyToInvest is true, OR
        // 2. investor status is "ready_to_invest", OR
        // 3. investor exists and isReadyToInvest is true
        const count = allFetchedUsers.filter(u => {
          return u.isReadyToInvest === true || 
                 u.investor?.status === "ready_to_invest" ||
                 (u.investor && u.isReadyToInvest);
        }).length;
        
        console.log('Ready to invest count:', count, 'out of', allFetchedUsers.length, 'users');
        console.log('Sample users:', allFetchedUsers.slice(0, 5).map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          isReadyToInvest: u.isReadyToInvest,
          investorStatus: u.investor?.status,
          hasInvestor: !!u.investor
        })));
        
        setReadyToInvestCount(count);
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Fallback to current page count
        setReadyToInvestCount(users.filter(u => u.investor?.status === "ready_to_invest" || u.isReadyToInvest).length);
      }
    };
    
    fetchAllForStats();
  }, []); // Only fetch once on mount

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [search, investorStatusFilter]);

  // Users are already filtered by server, no need for client-side filtering
  const filteredUsers = users;

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleCreateAdmin = async () => {
    if (!adminEmail && !adminFirebaseUid) {
      toast({
        title: 'Error',
        description: 'Please provide either email or Firebase UID',
        variant: 'destructive',
      });
      return;
    }

    setCreatingAdmin(true);
    try {
      const response = await createAdminUser({
        email: adminEmail || undefined,
        firebaseUid: adminFirebaseUid || undefined,
        firstName: adminFirstName || undefined,
        lastName: adminLastName || undefined,
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        
        // Reset form
        setAdminEmail('');
        setAdminFirebaseUid('');
        setAdminFirstName('');
        setAdminLastName('');
        setIsCreateAdminOpen(false);
        
        // Refresh users list
        const refreshResponse = await getUsers('ALL', {
          page: currentPage,
          size: pageSize,
          sort: 'id',
        });
        setUsers(refreshResponse.users);
        setPageInfo(refreshResponse.pageInfo || null);
        
        // Recalculate ready to invest count from current users
        const count = users.filter(u => 
          u.investor?.status === "ready_to_invest" || u.isReadyToInvest
        ).length;
        // Note: This is approximate from current page only
        // Full count is calculated in background fetch
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create admin user',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create admin user',
        variant: 'destructive',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleExport = () => {
    try {
      // Export all filtered users (not just current page)
      const exportData = filteredUsers.map(user => ({
        ID: user.id,
        'First Name': user.firstName,
        'Last Name': user.lastName,
        Email: user.email || 'N/A',
        Phone: user.phoneNumber || 'N/A',
        'PAN Number': user.panNumber || 'N/A',
        Role: user.role || 'N/A',
        Gender: user.gender || 'N/A',
        'Date of Birth': user.dateOfBirth || 'N/A',
        'Investor ID': user.investor?.id || 'N/A',
        'Investor Status': user.investor?.status?.replace(/_/g, ' ') || 'No Investor',
        Address: user.address ? `${user.address.address_line || ''}, ${user.address.city || ''}, ${user.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') : 'N/A',
      }));

      exportToCSV(exportData, `users-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: 'Success',
        description: 'Users data exported successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  // Calculate stats from pageInfo
  const stats = {
    total: pageInfo?.totalElements || 0,
    active: readyToInvestCount, // Will be updated as we fetch pages
    admins: users.filter(u => u.role?.toUpperCase() === "ADMIN").length,
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
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
              onClick={handleExport}
              disabled={users.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Users
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 py-2"
              onClick={() => setIsCreateAdminOpen(true)}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Create Admin
            </Button>
          </div>
        </motion.div>

        {/* Premium Stats Grid with Glassmorphism */}
        <div className="grid gap-6 md:grid-cols-3">
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
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Registered users</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Ready to Invest</CardTitle>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Active</Badge>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Ready to invest users</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Admins</CardTitle>
                <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800">Admin</Badge>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.admins}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Admin users</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, phone, or PAN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl"
                  />
                </div>
                <div>
                  <Select value={investorStatusFilter} onValueChange={setInvestorStatusFilter}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                      <SelectValue placeholder="Filter by investor status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="has_investor">Has Investor Account</SelectItem>
                      <SelectItem value="no_investor">No Investor Account</SelectItem>
                      <SelectItem value="ready_to_invest">Ready to Invest</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="incomplete_detail">Incomplete Detail</SelectItem>
                      <SelectItem value="incomplete_kyc_details">Incomplete KYC</SelectItem>
                      <SelectItem value="pending_nominee_authentication">Pending Nominee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  Users ({filteredUsers.length} of {stats.total})
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
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">PAN Card</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Role</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Investor Status</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Investment</TableHead>
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
                                {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</div>
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
                                <span className="text-slate-600 dark:text-slate-400">{user.phoneNumber || 'N/A'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-3 w-3 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {user.panNumber || 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                user.role?.toUpperCase() === "ADMIN" 
                                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }
                            >
                              {user.role || 'standard'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={
                                user.investor?.status === "ready_to_invest" 
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : user.investor?.status === "under_review"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : user.investor?.status
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }
                            >
                              {user.investor?.status?.replace(/_/g, ' ') || 'No Investor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-slate-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {user.investor?.id 
                                  ? `Investor #${user.investor.id}` 
                                  : user.isReadyToInvest 
                                    ? 'Ready' 
                                    : 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                              onClick={() => handleViewUser(user)}
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
              
              {/* Pagination */}
              {pageInfo && pageInfo.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, pageInfo.totalElements)} of {pageInfo.totalElements} users
                    </div>
                    <Select value={String(pageSize)} onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(0); // Reset to first page when changing page size
                    }}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: pageInfo.totalPages }, (_, i) => i).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 0 ||
                          page === pageInfo.totalPages - 1 ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return <PaginationEllipsis key={page} />;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(pageInfo.totalPages - 1, currentPage + 1))}
                          className={currentPage === pageInfo.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                {`${selectedUser?.firstName?.[0] || ''}${selectedUser?.lastName?.[0] || ''}`.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-xl font-bold">{selectedUser?.firstName} {selectedUser?.lastName}</div>
                <div className="text-sm text-slate-500 font-normal">User Details</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <UsersIcon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">User ID</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 break-all">{selectedUser?.id}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <UsersIcon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Full Name</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{selectedUser?.firstName} {selectedUser?.lastName}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 break-all">{selectedUser?.email || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Phone</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{selectedUser?.phoneNumber || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Date of Birth</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {selectedUser?.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <UsersIcon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Gender</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">{selectedUser?.gender || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <Sparkles className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Role</div>
                    <Badge 
                      className={
                        selectedUser?.role === "admin" 
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }
                    >
                      {selectedUser?.role || 'standard'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <TrendingUp className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">PAN Number</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{selectedUser?.panNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {selectedUser?.address && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Address</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Full Address</div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedUser.address.address_line && <div>{selectedUser.address.address_line}</div>}
                        {selectedUser.address.city && selectedUser.address.state && (
                          <div>{selectedUser.address.city}, {selectedUser.address.state}</div>
                        )}
                        {!selectedUser.address.address_line && !selectedUser.address.city && 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Investor Information */}
            {selectedUser?.investor && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Investor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Investor ID</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedUser.investor.id || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Status</div>
                        <Badge 
                          className={
                            selectedUser.investor.status === "ready_to_invest" 
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : selectedUser.investor.status === "under_review"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }
                        >
                          {selectedUser.investor.status?.replace(/_/g, ' ') || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Admin User Dialog */}
      <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/20 dark:border-violet-800/20">
                <ShieldCheck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <DialogTitle className="text-2xl font-bold">Create Admin User</DialogTitle>
            </div>
            <DialogDescription>
              Create a new admin user or promote an existing user to admin. Provide either email or Firebase UID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={creatingAdmin}
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email of the user to promote to admin
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or</span>
              </div>
            </div>

            {/* Firebase UID Input */}
            <div className="space-y-2">
              <Label htmlFor="admin-uid" className="text-sm font-medium">
                Firebase UID
              </Label>
              <Input
                id="admin-uid"
                type="text"
                placeholder="abc123xyz789"
                value={adminFirebaseUid}
                onChange={(e) => setAdminFirebaseUid(e.target.value)}
                disabled={creatingAdmin}
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Firebase user ID (if you know it)
              </p>
            </div>

            {/* Optional: First Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-firstname" className="text-sm font-medium">
                First Name <span className="text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="admin-firstname"
                type="text"
                placeholder="John"
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                disabled={creatingAdmin}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Optional: Last Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-lastname" className="text-sm font-medium">
                Last Name <span className="text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="admin-lastname"
                type="text"
                placeholder="Doe"
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                disabled={creatingAdmin}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                <strong>Note:</strong> The user must exist in Firebase Authentication. 
                They will be granted admin privileges and custom claims will be set automatically.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateAdminOpen(false);
                setAdminEmail('');
                setAdminFirebaseUid('');
                setAdminFirstName('');
                setAdminLastName('');
              }}
              disabled={creatingAdmin}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAdmin}
              disabled={creatingAdmin || (!adminEmail && !adminFirebaseUid)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
            >
              {creatingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Create Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}