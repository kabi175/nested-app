"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Pencil,
  Trash2,
  Building,
  IndianRupee,
  BookOpen,
  TrendingUp,
  Eye,
  GraduationCap,
  Download,
  Percent,
  Search,
  X,
  Database,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getEducation, createEducation, updateEducation, deleteEducation, Education } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV } from '@/lib/export-utils';
import type { PageInfo } from '@/lib/api-client';

export default function EducationPage() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INSTITUTION' | 'COURSE'>('ALL');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    name: '',
    type: 'INSTITUTION' as 'INSTITUTION' | 'COURSE',
    country: 'India',
    lastYearFee: '',
    expectedIncreasePercentLt10Yr: '',
    expectedIncreasePercentGt10Yr: ''
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(0);
  }, [typeFilter, sortBy, sortOrder]);

  // Fetch education from API
  useEffect(() => {
    fetchEducation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearchTerm, typeFilter, sortBy, sortOrder]);

  const fetchEducation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch with pagination first
      const sortParam = sortBy === 'id' ? 'id' : 
                       sortBy === 'name' ? 'name' :
                       sortBy === 'fee' ? 'lastYearFee' :
                       sortBy === 'country' ? 'country' : 'id';
      
      const sortValue = `${sortParam},${sortOrder}`;
      
      const response = await getEducation(
        {
          page: currentPage,
          size: pageSize,
          sort: sortValue,
        },
        debouncedSearchTerm || undefined,
        typeFilter !== 'ALL' ? typeFilter : undefined
      );
      
      // If backend returns pagination info, use it (server-side pagination)
      if (response.pageInfo && response.pageInfo.totalPages > 0) {
        setEducation(response.education);
        setPageInfo(response.pageInfo);
      } else {
        // Client-side pagination and sorting fallback
        // Fetch all data without pagination for client-side processing
        const allResponse = await getEducation(
          undefined, // No pagination - fetch all
          debouncedSearchTerm || undefined,
          typeFilter !== 'ALL' ? typeFilter : undefined
        );
        
        let allEducation = [...allResponse.education];
        
        // Client-side sorting
        const sortParamLocal = sortBy === 'id' ? 'id' : 
                              sortBy === 'name' ? 'name' :
                              sortBy === 'fee' ? 'lastYearFee' :
                              sortBy === 'country' ? 'country' : 'id';
        
        allEducation.sort((a, b) => {
          let aVal: any;
          let bVal: any;
          
          if (sortParamLocal === 'id') {
            aVal = parseInt(a.id) || 0;
            bVal = parseInt(b.id) || 0;
          } else if (sortParamLocal === 'name') {
            aVal = (a.name || '').toLowerCase();
            bVal = (b.name || '').toLowerCase();
          } else if (sortParamLocal === 'lastYearFee') {
            aVal = a.lastYearFee || 0;
            bVal = b.lastYearFee || 0;
          } else if (sortParamLocal === 'country') {
            aVal = (a.country || '').toLowerCase();
            bVal = (b.country || '').toLowerCase();
          } else {
            return 0;
          }
          
          if (typeof aVal === 'string') {
            return sortOrder === 'asc' 
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          } else {
            return sortOrder === 'asc' 
              ? aVal - bVal
              : bVal - aVal;
          }
        });
        
        // Client-side pagination
        const totalElements = allEducation.length;
        const totalPages = Math.ceil(totalElements / pageSize) || 1;
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedEducation = allEducation.slice(startIndex, endIndex);
        
        setEducation(paginatedEducation);
        setPageInfo({
          page: currentPage,
          size: pageSize,
          totalElements,
          totalPages,
        });
      }
    } catch (err) {
      console.error('Error fetching education:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch education records');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const handleAddEducation = async () => {
    setIsSubmitting(true);
    try {
      await createEducation({
        name: formData.name,
        type: formData.type,
        country: formData.country,
        lastYearFee: parseFloat(formData.lastYearFee),
        expectedFee: parseFloat(formData.lastYearFee), // Store last year fee as expected fee for now
        expectedIncreasePercentLt10Yr: parseFloat(formData.expectedIncreasePercentLt10Yr),
        expectedIncreasePercentGt10Yr: parseFloat(formData.expectedIncreasePercentGt10Yr),
      });
      
      toast({
        title: 'Success',
        description: 'Education record added successfully',
      });
      
      // Reset form and close dialog
      setFormData({
        name: '',
        type: 'INSTITUTION',
        country: 'India',
        lastYearFee: '',
        expectedIncreasePercentLt10Yr: '',
        expectedIncreasePercentGt10Yr: ''
      });
      setIsAddDialogOpen(false);
      
      // Refresh list
      await fetchEducation();
    } catch (err) {
      console.error('Error creating education:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create education record',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEducation = async () => {
    if (!editingEducation) return;
    
    setIsSubmitting(true);
    try {
      await updateEducation({
        id: editingEducation.id,
        name: formData.name,
        type: formData.type,
        country: formData.country,
        lastYearFee: parseFloat(formData.lastYearFee),
        expectedFee: parseFloat(formData.lastYearFee), // Store last year fee as expected fee for now
        expectedIncreasePercentLt10Yr: parseFloat(formData.expectedIncreasePercentLt10Yr),
        expectedIncreasePercentGt10Yr: parseFloat(formData.expectedIncreasePercentGt10Yr),
      });
      
      toast({
        title: 'Success',
        description: 'Education record updated successfully',
      });
      
      // Reset form and close dialog
      setFormData({
        name: '',
        type: 'INSTITUTION',
        country: 'India',
        lastYearFee: '',
        expectedIncreasePercentLt10Yr: '',
        expectedIncreasePercentGt10Yr: ''
      });
      setEditingEducation(null);
      setIsEditDialogOpen(false);
      
      // Refresh list
      await fetchEducation();
    } catch (err) {
      console.error('Error updating education:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update education record',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEducation = async (edu: Education) => {
    if (!confirm(`Are you sure you want to delete ${edu.name}?`)) {
      return;
    }
    
    try {
      await deleteEducation(edu.id);
      
      toast({
        title: 'Success',
        description: 'Education record deleted successfully',
      });
      
      // Refresh list
      await fetchEducation();
    } catch (err) {
      console.error('Error deleting education:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete education record',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      name: edu.name,
      type: edu.type,
      country: edu.country,
      lastYearFee: edu.lastYearFee.toString(),
      expectedIncreasePercentLt10Yr: edu.expectedIncreasePercentLt10Yr.toString(),
      expectedIncreasePercentGt10Yr: edu.expectedIncreasePercentGt10Yr.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleExport = () => {
    try {
      const exportData = education.map(edu => ({
        ID: edu.id,
        Name: edu.name,
        Type: edu.type,
        Country: edu.country,
        'Last Year Fee (INR)': edu.lastYearFee,
        'Expected % Increase (<10 Yr)': edu.expectedIncreasePercentLt10Yr,
        'Expected % Increase (>10 Yr)': edu.expectedIncreasePercentGt10Yr,
      }));

      exportToCSV(exportData, `education-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: 'Success',
        description: 'Education data exported successfully',
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
    total: pageInfo?.totalElements || education.length,
    institutions: education.filter(e => e.type === "INSTITUTION").length,
    courses: education.filter(e => e.type === "COURSE").length,
    avgFees: Math.round(education.reduce((sum, e) => sum + e.lastYearFee, 0) / education.length) || 0,
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/20 dark:border-emerald-800/20">
                <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 dark:from-slate-100 dark:via-emerald-100 dark:to-teal-100 bg-clip-text text-transparent">
                  Education Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                  Manage colleges and courses for financial planning
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
              disabled={education.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total Records</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Education records</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Institutions</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.institutions}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Colleges & Universities</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Courses</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.courses}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Individual programs</p>
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
                <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Average Fees</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/20 dark:border-slate-700/30 group-hover:scale-110 transition-transform duration-200">
                  <IndianRupee className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 min-h-[88px]">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">{stats.avgFees}</div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Last year average</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Education Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/20 dark:border-emerald-800/20">
                      <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Education Records ({pageInfo?.totalElements || education.length})
                  </CardTitle>
                  {/* Search Input */}
                  <div className="relative w-full sm:w-auto min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search by name or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10 w-full bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Filters and Sort */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Type Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Select
                      value={typeFilter}
                      onValueChange={(value: 'ALL' | 'INSTITUTION' | 'COURSE') => setTypeFilter(value)}
                    >
                      <SelectTrigger className="w-[150px] bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="INSTITUTION">Institutions</SelectItem>
                        <SelectItem value="COURSE">Courses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger className="w-[150px] bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="fee">Fee</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Sort Order Toggle Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 px-3"
                      title={sortOrder === 'asc' ? 'Ascending - Click to sort descending' : 'Descending - Click to sort ascending'}
                    >
                      {sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Page Size */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Per page:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(parseInt(value));
                        setCurrentPage(0);
                      }}
                    >
                      <SelectTrigger className="w-[80px] bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Name</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Type</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Country</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Last Year Fee</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">% Inc less then 10 Yr</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">% Inc greater then 10 Yr</TableHead>
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
                              <GraduationCap className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-red-600 dark:text-red-400 font-medium">Error loading education records</p>
                              <p className="text-slate-500 dark:text-slate-500 text-sm">{error}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : education.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <GraduationCap className="h-8 w-8 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-slate-600 dark:text-slate-400 font-medium">No education records found</p>
                              <p className="text-slate-500 dark:text-slate-500 text-sm">Add your first education record to get started</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      education.map((edu, index) => (
                        <motion.tr 
                          key={edu.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-200/50 dark:border-slate-700/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {edu.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{edu.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={
                              edu.type === 'INSTITUTION'
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800"
                            }>
                              {edu.type === 'INSTITUTION' ? 'College' : 'Course'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{edu.country}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="h-4 w-4 text-emerald-600" />
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{edu.lastYearFee}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Percent className="h-3 w-3 text-amber-600" />
                              <span className="font-medium text-slate-900 dark:text-slate-100">{edu.expectedIncreasePercentLt10Yr}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Percent className="h-3 w-3 text-amber-600" />
                              <span className="font-medium text-slate-900 dark:text-slate-100">{edu.expectedIncreasePercentGt10Yr}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                onClick={() => openEditDialog(edu)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
                                onClick={() => handleDeleteEducation(edu)}
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
              
              {/* Pagination */}
              {pageInfo && pageInfo.totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {pageInfo.totalElements > 0 ? currentPage * pageSize + 1 : 0} to {Math.min((currentPage + 1) * pageSize, pageInfo.totalElements || 0)} of {pageInfo.totalElements || 0} records
                  </div>
                  {pageInfo.totalPages > 1 && (
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
                            onClick={() => setCurrentPage(Math.min((pageInfo.totalPages || 1) - 1, currentPage + 1))}
                            className={currentPage >= (pageInfo.totalPages || 1) - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Education Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Education Record</DialogTitle>
            <DialogDescription>
              Add a new college or course for education planning.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">College/Course Name *</Label>
              <Input
                id="name"
                placeholder="e.g., IIT Bombay or MBA Program"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'INSTITUTION' | 'COURSE') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTITUTION">Institution (College/University)</SelectItem>
                  <SelectItem value="COURSE">Course (Specific Program)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                placeholder="e.g., India"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastYearFee">Last Year Fee (INR) *</Label>
              <Input
                id="lastYearFee"
                type="number"
                placeholder="500000"
                value={formData.lastYearFee}
                onChange={(e) => setFormData({ ...formData, lastYearFee: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lt10yr">Expected % Increase &lt; 10 Yr *</Label>
                <Input
                  id="lt10yr"
                  type="number"
                  step="0.1"
                  placeholder="8.5"
                  value={formData.expectedIncreasePercentLt10Yr}
                  onChange={(e) => setFormData({ ...formData, expectedIncreasePercentLt10Yr: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gt10yr">Expected % Increase &gt; 10 Yr *</Label>
                <Input
                  id="gt10yr"
                  type="number"
                  step="0.1"
                  placeholder="10.5"
                  value={formData.expectedIncreasePercentGt10Yr}
                  onChange={(e) => setFormData({ ...formData, expectedIncreasePercentGt10Yr: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEducation}
              disabled={
                isSubmitting ||
                !formData.name ||
                !formData.lastYearFee ||
                !formData.expectedIncreasePercentLt10Yr ||
                !formData.expectedIncreasePercentGt10Yr
              }
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isSubmitting ? 'Adding...' : 'Add Education'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Education Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Education Record</DialogTitle>
            <DialogDescription>
              Update the education information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">College/Course Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., IIT Bombay or MBA Program"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'INSTITUTION' | 'COURSE') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTITUTION">Institution (College/University)</SelectItem>
                  <SelectItem value="COURSE">Course (Specific Program)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-country">Country *</Label>
              <Input
                id="edit-country"
                placeholder="e.g., India"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-lastYearFee">Last Year Fee (INR) *</Label>
              <Input
                id="edit-lastYearFee"
                type="number"
                placeholder="500000"
                value={formData.lastYearFee}
                onChange={(e) => setFormData({ ...formData, lastYearFee: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-lt10yr">Expected % Increase &lt; 10 Yr *</Label>
                <Input
                  id="edit-lt10yr"
                  type="number"
                  step="0.1"
                  placeholder="8.5"
                  value={formData.expectedIncreasePercentLt10Yr}
                  onChange={(e) => setFormData({ ...formData, expectedIncreasePercentLt10Yr: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-gt10yr">Expected % Increase &gt; 10 Yr *</Label>
                <Input
                  id="edit-gt10yr"
                  type="number"
                  step="0.1"
                  placeholder="10.5"
                  value={formData.expectedIncreasePercentGt10Yr}
                  onChange={(e) => setFormData({ ...formData, expectedIncreasePercentGt10Yr: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditEducation}
              disabled={
                isSubmitting ||
                !formData.name ||
                !formData.lastYearFee ||
                !formData.expectedIncreasePercentLt10Yr ||
                !formData.expectedIncreasePercentGt10Yr
              }
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isSubmitting ? 'Updating...' : 'Update Education'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
