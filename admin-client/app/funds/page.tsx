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
  TrendingUp, 
  Pencil,
  Save,
  X,
  Sparkles,
  Filter,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getFunds, updateFundLabel, Fund } from '@/lib/api';
import { exportToCSV } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import type { PageInfo } from '@/lib/api-client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FundsPage() {
  const { toast } = useToast();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [activeOnlyFilter, setActiveOnlyFilter] = useState<boolean | 'all'>('all');
  
  // Edit state
  const [editingFundId, setEditingFundId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch funds from API
  useEffect(() => {
    fetchFunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, activeOnlyFilter]);

  const fetchFunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFunds(
        {
          page: currentPage,
          size: pageSize,
          sort: 'id',
        },
        activeOnlyFilter === true
      );
      setFunds(response.funds);
      setPageInfo(response.pageInfo || null);
    } catch (err) {
      console.error('Error fetching funds:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch funds');
    } finally {
      setLoading(false);
    }
  };

  const filteredFunds = funds.filter(fund =>
    (fund.displayName || fund.name).toLowerCase().includes(search.toLowerCase()) ||
    fund.id.toLowerCase().includes(search.toLowerCase()) ||
    (fund.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (fund: Fund) => {
    setEditingFundId(fund.id);
    setEditingLabel(fund.displayName || fund.name);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingFundId || !editingLabel.trim()) {
      toast({
        title: 'Error',
        description: 'Label cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedFund = await updateFundLabel(editingFundId, editingLabel.trim());
      
      // Update the fund in the list
      setFunds(funds.map(fund => 
        fund.id === editingFundId 
          ? { ...fund, displayName: updatedFund.displayName }
          : fund
      ));

      toast({
        title: 'Success',
        description: 'Fund label updated successfully',
      });
      
      setIsEditDialogOpen(false);
      setEditingFundId(null);
      setEditingLabel('');
    } catch (err) {
      console.error('Error updating fund label:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update fund label',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditDialogOpen(false);
    setEditingFundId(null);
    setEditingLabel('');
  };

  const handleExport = () => {
    const exportData = filteredFunds.map(fund => ({
      ID: fund.id,
      'Display Name': fund.displayName || fund.name,
      Name: fund.name,
      Description: fund.description || '',
      NAV: fund.nav,
      'Min Amount': '',
      Active: fund.isActive ? 'Yes' : 'No',
    }));
    
    exportToCSV(exportData, 'funds');
    toast({
      title: 'Success',
      description: 'Funds exported successfully',
    });
  };

  const stats = {
    total: pageInfo?.totalElements || funds.length,
    active: funds.filter(f => f.isActive).length,
    inactive: funds.filter(f => !f.isActive).length,
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        </TableRow>
      ))}
    </>
  );

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
              <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/20 dark:border-amber-800/20">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                  Fund Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Manage and edit fund labels
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
              disabled={filteredFunds.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Funds
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total Funds</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">All funds</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Active Funds</CardTitle>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Active</Badge>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Active funds</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/20 dark:to-gray-950/20 border border-slate-200/50 dark:border-slate-800/30">
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Inactive Funds</CardTitle>
                <Badge className="bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">Inactive</Badge>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.inactive}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Inactive funds</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search funds by name, ID, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-xl"
            />
          </div>
          <Select
            value={activeOnlyFilter === true ? 'active' : activeOnlyFilter === false ? 'inactive' : 'all'}
            onValueChange={(value) => {
              if (value === 'active') setActiveOnlyFilter(true);
              else if (value === 'inactive') setActiveOnlyFilter(false);
              else setActiveOnlyFilter('all');
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Funds</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Funds Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Funds ({filteredFunds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Display Name (Label)</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>NAV</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <LoadingSkeleton />
                  </TableBody>
                </Table>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  <Button
                    variant="outline"
                    onClick={fetchFunds}
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredFunds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No funds found</p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableHead>ID</TableHead>
                        <TableHead>Display Name (Label)</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>NAV</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFunds.map((fund) => (
                        <TableRow key={fund.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <TableCell className="font-mono text-sm">{fund.id}</TableCell>
                          <TableCell className="font-medium">
                            {fund.displayName || fund.name}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {fund.name}
                          </TableCell>
                          <TableCell>₹{fund.nav.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={fund.isActive ? "default" : "secondary"}
                              className={fund.isActive 
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }
                            >
                              {fund.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(fund)}
                              className="hover:bg-amber-50 dark:hover:bg-amber-950/20"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Label
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {pageInfo && pageInfo.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 0) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, pageInfo.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pageInfo.totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > pageInfo.totalPages - 4) {
                    pageNum = pageInfo.totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pageInfo.totalPages - 1) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage >= pageInfo.totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Fund Label</DialogTitle>
              <DialogDescription>
                Update the display name (label) for this fund. This label will be shown in the application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fund-label">Display Name (Label)</Label>
                <Input
                  id="fund-label"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  placeholder="Enter fund display name"
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !editingLabel.trim()}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
