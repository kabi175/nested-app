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
  Filter,
  Sparkles,
  Eye,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Zap,
  Download,
  X
} from 'lucide-react';
import { getBaskets, createBasket, updateBasket, deleteBasket, Basket, getFunds, Fund } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV } from '@/lib/export-utils';
import type { PageInfo } from '@/lib/api-client';

interface BasketFund {
  fundId: string;
  fundName: string;
  percentage: number;
}

interface SelectedFund {
  fundId: string;
  percentage: number;
}

export default function BasketsPage() {
  const { toast } = useToast();
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basketName, setBasketName] = useState('');
  const [basketYears, setBasketYears] = useState('');
  const [editingBasket, setEditingBasket] = useState<Basket | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  
  // Fund selection state
  const [availableFunds, setAvailableFunds] = useState<Fund[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<SelectedFund[]>([]);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [fundSearchTerms, setFundSearchTerms] = useState<{ [key: number]: string }>({});

  // Fetch baskets from API
  useEffect(() => {
    fetchBaskets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // Fetch funds when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      fetchFunds();
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  const fetchBaskets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBaskets({
        page: currentPage,
        size: pageSize,
        sort: 'id',
      });
      setBaskets(response.baskets);
      setPageInfo(response.pageInfo || null);
    } catch (err) {
      console.error('Error fetching baskets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch baskets');
    } finally {
      setLoading(false);
    }
  };

  const fetchFunds = async () => {
    setLoadingFunds(true);
    try {
      // Fetch all funds for admin to select from (not just active)
      const response = await getFunds({ size: 5000 }, false);
      // Sort funds alphabetically by displayName or name
      const sortedFunds = response.funds.sort((a, b) => {
        const nameA = (a.displayName || a.name).toLowerCase();
        const nameB = (b.displayName || b.name).toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setAvailableFunds(sortedFunds);
    } catch (err) {
      console.error('Error fetching funds:', err);
      toast({
        title: 'Error',
        description: 'Failed to load funds',
        variant: 'destructive',
      });
    } finally {
      setLoadingFunds(false);
    }
  };

  const addFund = () => {
    setSelectedFunds([...selectedFunds, { fundId: '', percentage: 0 }]);
  };

  const removeFund = (index: number) => {
    setSelectedFunds(selectedFunds.filter((_, i) => i !== index));
  };

  const updateFundId = (index: number, fundId: string) => {
    const updated = [...selectedFunds];
    updated[index] = { ...updated[index], fundId };
    setSelectedFunds(updated);
  };

  const updatePercentage = (index: number, percentage: number) => {
    const updated = [...selectedFunds];
    updated[index] = { ...updated[index], percentage };
    setSelectedFunds(updated);
  };

  const getTotalPercentage = () => {
    return selectedFunds.reduce((sum, fund) => sum + fund.percentage, 0);
  };

  const handleCreateBasket = async () => {
    if (!basketName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a basket name',
        variant: 'destructive',
      });
      return;
    }

    const totalPercentage = getTotalPercentage();
    if (selectedFunds.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        title: 'Error',
        description: `Total percentage must be 100%. Current total: ${totalPercentage.toFixed(1)}%`,
        variant: 'destructive',
      });
      return;
    }

    if (selectedFunds.some(f => !f.fundId)) {
      toast({
        title: 'Error',
        description: 'Please select a fund for all entries',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create payload according to BasketDTO structure
      // Backend expects "id" not "fundId" (see @JsonProperty("id") in BasketFundDTO)
      const fundsPayload = selectedFunds.map(sf => ({
        id: parseInt(sf.fundId),
        allocationPercentage: sf.percentage,
      }));

      await createBasket({
        title: basketName,
        years: basketYears ? parseFloat(basketYears) : undefined,
        funds: fundsPayload,
      });

      toast({
        title: 'Success',
        description: 'Basket created successfully with fund allocations.',
      });

      setBasketName('');
      setBasketYears('');
      setSelectedFunds([]);
      setFundSearchTerms({});
      setIsCreateDialogOpen(false);
      await fetchBaskets();
    } catch (err) {
      console.error('Error creating basket:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create basket',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (basket: Basket) => {
    setEditingBasket(basket);
    setBasketName(basket.name);
    setBasketYears(basket.duration ? String(basket.duration) : '');
    setSelectedFunds(basket.funds.map(f => ({
      fundId: f.fundId,
      percentage: f.percentage,
    })));
    setIsEditDialogOpen(true);
  };

  const handleEditBasket = async () => {
    if (!editingBasket) return;
    
    if (!basketName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a basket name',
        variant: 'destructive',
      });
      return;
    }

    const totalPercentage = getTotalPercentage();
    if (selectedFunds.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        title: 'Error',
        description: `Total percentage must be 100%. Current total: ${totalPercentage.toFixed(1)}%`,
        variant: 'destructive',
      });
      return;
    }

    if (selectedFunds.some(f => !f.fundId)) {
      toast({
        title: 'Error',
        description: 'Please select a fund for all entries',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects "id" not "fundId" (see @JsonProperty("id") in BasketFundDTO)
      const fundsPayload = selectedFunds.map(sf => ({
        id: parseInt(sf.fundId),
        allocationPercentage: sf.percentage,
      }));

      await updateBasket({
        id: editingBasket.id,
        title: basketName,
        years: basketYears ? parseFloat(basketYears) : undefined,
        funds: fundsPayload,
      });

      toast({
        title: 'Success',
        description: 'Basket updated successfully.',
      });

      setBasketName('');
      setBasketYears('');
      setSelectedFunds([]);
      setFundSearchTerms({});
      setEditingBasket(null);
      setIsEditDialogOpen(false);
      await fetchBaskets();
    } catch (err) {
      console.error('Error updating basket:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update basket',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBasket = async (basket: Basket) => {
    if (!confirm(`Are you sure you want to delete ${basket.name}?`)) {
      return;
    }

    try {
      await deleteBasket(basket.id);

      toast({
        title: 'Success',
        description: 'Basket deleted successfully',
      });

      await fetchBaskets();
    } catch (err) {
      console.error('Error deleting basket:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete basket',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    try {
      const exportData = baskets.map(basket => ({
        ID: basket.id,
        Name: basket.name,
        'Duration (Years)': basket.duration,
        'Number of Funds': basket.funds?.length || 0,
        'Total Allocation %': basket.totalPercentage,
        'Created Date': basket.createdAt ? new Date(basket.createdAt).toLocaleDateString() : 'N/A',
      }));

      exportToCSV(exportData, `baskets-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: 'Success',
        description: 'Baskets data exported successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: pageInfo?.totalElements || baskets.length,
  };

  // Check if basket name already exists (case-insensitive)
  const isBasketNameTaken = (name: string, excludeId?: string): boolean => {
    if (!name.trim()) return false;
    return baskets.some(
      basket => basket.name.toLowerCase() === name.trim().toLowerCase() && basket.id !== excludeId
    );
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
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
              onClick={handleExport}
              disabled={baskets.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-2"
              onClick={() => setIsCreateDialogOpen(true)}
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
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Investment baskets</p>
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
                        <TableCell colSpan={5} className="text-center py-12">
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
                        <TableCell colSpan={5} className="text-center py-12">
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
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="font-medium text-slate-900 dark:text-slate-100">{basket.duration} years</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                                onClick={() => openEditDialog(basket)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
                                onClick={() => handleDeleteBasket(basket)}
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

      {/* Create Basket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Basket</DialogTitle>
            <DialogDescription>
              Create a new investment basket with fund allocations. Total percentage must equal 100%.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="basketName">Basket Name *</Label>
              <Input
                id="basketName"
                placeholder="e.g., Conservative Growth Portfolio"
                value={basketName}
                onChange={(e) => setBasketName(e.target.value)}
                className={isBasketNameTaken(basketName) ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {isBasketNameTaken(basketName) && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  This basket name is already taken
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="basketYears">Duration (Years)</Label>
              <Input
                id="basketYears"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g., 5"
                value={basketYears}
                onChange={(e) => setBasketYears(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Fund Allocations</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addFund}
                  disabled={loadingFunds}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fund
                </Button>
              </div>

              {loadingFunds ? (
                <div className="text-center py-4 text-sm text-slate-500">Loading funds...</div>
              ) : (
                <>
                  {selectedFunds.map((fund, index) => {
                    const searchTerm = fundSearchTerms[index] || '';
                    const filteredFunds = availableFunds.filter(f => 
                      (f.displayName || f.name).toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    return (
                    <div key={index} className="flex items-end gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex-1 grid gap-2">
                        <Label htmlFor={`fund-${index}`}>Fund</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Search funds..."
                            value={searchTerm}
                            onChange={(e) => setFundSearchTerms({ ...fundSearchTerms, [index]: e.target.value })}
                            className="h-9"
                          />
                          <Select
                            value={fund.fundId}
                            onValueChange={(value) => updateFundId(index, value)}
                          >
                            <SelectTrigger id={`fund-${index}`} className="w-full">
                              <SelectValue placeholder="Select a fund" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] overflow-y-auto">
                            {filteredFunds.length === 0 ? (
                              <div className="py-6 text-center text-sm text-slate-500">
                                No funds found
                              </div>
                            ) : (
                              filteredFunds.map((availableFund) => {
                                const isDisabled = selectedFunds.some(
                                  (sf, i) => i !== index && sf.fundId === availableFund.id
                                );
                                return (
                                  <SelectItem
                                    key={availableFund.id}
                                    value={availableFund.id.toString()}
                                    disabled={isDisabled}
                                  >
                                    {availableFund.displayName || availableFund.name}
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>

                          </Select>
                        </div>
                      </div>
                      <div className="w-32 grid gap-2">
                        <Label htmlFor={`percentage-${index}`}>Percentage</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`percentage-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={fund.percentage || ''}
                            onChange={(e) => updatePercentage(index, parseFloat(e.target.value) || 0)}
                            placeholder="0"
                          />
                          <span className="text-sm text-slate-500">%</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFund(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                  })}

                  {selectedFunds.length > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Total Allocation:</span>
                      <span className={`text-xl font-bold ${
                        Math.abs(getTotalPercentage() - 100) < 0.01
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : getTotalPercentage() > 100
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {getTotalPercentage().toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {selectedFunds.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-500">
                      No funds added yet. Click "Add Fund" to start building your basket.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBasketName('');
                setBasketYears('');
                setSelectedFunds([]);
                setFundSearchTerms({});
                setIsCreateDialogOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBasket}
              disabled={
                isSubmitting || 
                !basketName.trim() || 
                isBasketNameTaken(basketName) ||
                selectedFunds.length === 0 ||
                Math.abs(getTotalPercentage() - 100) > 0.01 ||
                selectedFunds.some(f => !f.fundId)
              }
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Basket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Basket Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Basket</DialogTitle>
            <DialogDescription>
              Update the investment basket details and fund allocations. Total percentage must equal 100%.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-basketName">Basket Name</Label>
              <Input
                id="edit-basketName"
                placeholder="e.g., Conservative Growth Portfolio"
                value={basketName}
                disabled
                className="bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Basket name cannot be changed after creation
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-basketYears">Duration (Years)</Label>
              <Input
                id="edit-basketYears"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g., 5"
                value={basketYears}
                onChange={(e) => setBasketYears(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Fund Allocations</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addFund}
                  disabled={loadingFunds}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fund
                </Button>
              </div>

              {loadingFunds ? (
                <div className="text-center py-4 text-sm text-slate-500">Loading funds...</div>
              ) : (
                <>
                  {selectedFunds.map((fund, index) => {
                    const searchTerm = fundSearchTerms[index] || '';
                    const filteredFunds = availableFunds.filter(f => 
                      (f.displayName || f.name).toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    return (
                    <div key={index} className="flex items-end gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex-1 grid gap-2">
                        <Label htmlFor={`edit-fund-${index}`}>Fund</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Search funds..."
                            value={searchTerm}
                            onChange={(e) => setFundSearchTerms({ ...fundSearchTerms, [index]: e.target.value })}
                            className="h-9"
                          />
                          <Select
                            value={fund.fundId}
                            onValueChange={(value) => updateFundId(index, value)}
                          >
                            <SelectTrigger id={`edit-fund-${index}`} className="w-full">
                              <SelectValue placeholder="Select a fund" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              <ScrollArea className="h-full max-h-[280px]">
                                {filteredFunds.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-slate-500">No funds found</div>
                                ) : (
                                  filteredFunds.map((availableFund) => {
                                    const isDisabled = selectedFunds.some((sf, i) => i !== index && sf.fundId === availableFund.id);
                                    return (
                                      <SelectItem 
                                        key={availableFund.id} 
                                        value={availableFund.id}
                                        disabled={isDisabled}
                                      >
                                        {availableFund.displayName || availableFund.name}
                                      </SelectItem>
                                    );
                                  })
                                )}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="w-32 grid gap-2">
                        <Label htmlFor={`edit-percentage-${index}`}>Percentage</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`edit-percentage-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={fund.percentage || ''}
                            onChange={(e) => updatePercentage(index, parseFloat(e.target.value) || 0)}
                            placeholder="0"
                          />
                          <span className="text-sm text-slate-500">%</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFund(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                  })}

                  {selectedFunds.length > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Total Allocation:</span>
                      <span className={`text-xl font-bold ${
                        Math.abs(getTotalPercentage() - 100) < 0.01
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : getTotalPercentage() > 100
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {getTotalPercentage().toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {selectedFunds.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-500">
                      No funds added yet. Click "Add Fund" to start building your basket.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBasketName('');
                setBasketYears('');
                setSelectedFunds([]);
                setFundSearchTerms({});
                setEditingBasket(null);
                setIsEditDialogOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditBasket}
              disabled={
                isSubmitting || 
                selectedFunds.length === 0 ||
                Math.abs(getTotalPercentage() - 100) > 0.01 ||
                selectedFunds.some(f => !f.fundId)
              }
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Updating...' : 'Update Basket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}