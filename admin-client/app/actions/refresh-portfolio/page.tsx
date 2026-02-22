"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  RefreshCw,
  User as UserIcon,
  Mail,
  Phone,
  Check,
  ChevronsUpDown,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { getUsers, User, refreshUserPortfolio } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RefreshPortfolioPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        // Fetch all users in batches
        let allUsers: User[] = [];
        let currentPage = 0;
        let hasMore = true;
        const batchSize = 100;

        while (hasMore && currentPage < 50) {
          const response = await getUsers('ALL', {
            page: currentPage,
            size: batchSize,
            sort: 'id',
          });

          allUsers = [...allUsers, ...response.users];

          if (response.pageInfo) {
            hasMore = currentPage < response.pageInfo.totalPages - 1;
            currentPage++;
          } else {
            hasMore = response.users.length === batchSize;
            currentPage++;
          }
        }

        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleTriggerRefresh = async () => {
    if (!selectedUser) return;

    setIsTriggering(true);
    setIsConfirmDialogOpen(false);

    try {
      await refreshUserPortfolio(selectedUser.id);
      toast({
        title: 'Success',
        description: `Portfolio refresh triggered successfully for ${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (ID: ${selectedUser.id})`,
      });
      // Optionally clear selection after success
      // setSelectedUser(null);
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trigger portfolio refresh',
        variant: 'destructive',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <Link href="/actions">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Actions
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20">
              <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                Force Refresh User Portfolio
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Select a user and trigger a manual portfolio refresh
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Select User
                </CardTitle>
                <CardDescription>
                  Search and select a user to refresh their portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-select">User</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 rounded-xl h-11"
                        disabled={loadingUsers}
                      >
                        {selectedUser
                          ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (ID: ${selectedUser.id})`
                          : loadingUsers
                          ? "Loading users..."
                          : "Select user..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search by name, email, or ID..." />
                        <CommandList>
                          <CommandEmpty>
                            {loadingUsers ? 'Loading users...' : 'No user found.'}
                          </CommandEmpty>
                          <CommandGroup>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.firstName || ''} ${user.lastName || ''} ${user.email || ''} ${user.id}`}
                                onSelect={() => {
                                  setSelectedUser(user);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user.firstName || ''} {user.lastName || ''} (ID: {user.id})
                                  </span>
                                  {user.email && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {user.email}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={() => setIsConfirmDialogOpen(true)}
                      disabled={isTriggering}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    >
                      {isTriggering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Triggering Refresh...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Trigger Portfolio Refresh
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected User Info Card */}
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    User Information
                  </CardTitle>
                  <CardDescription>
                    Details for the selected user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {(selectedUser.firstName?.[0] || '').toUpperCase()}{(selectedUser.lastName?.[0] || '').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {selectedUser.firstName || ''} {selectedUser.lastName || ''}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          ID: {selectedUser.id}
                        </div>
                      </div>
                    </div>

                    {selectedUser.email && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {selectedUser.email}
                        </span>
                      </div>
                    )}

                    {selectedUser.phoneNumber && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {selectedUser.phoneNumber}
                        </span>
                      </div>
                    )}

                    {selectedUser.investor && (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Investor Status
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            selectedUser.investor.status === 'ready_to_invest'
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          }
                        >
                          {selectedUser.investor.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
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
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                About Portfolio Refresh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                This action will force the system to recalculate and refresh the selected user's portfolio data. 
                This may take a few moments to complete. The refresh will update all portfolio-related information 
                including holdings, valuations, and performance metrics.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Portfolio Refresh</DialogTitle>
            <DialogDescription>
              Are you sure you want to trigger a portfolio refresh for{' '}
              <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> (ID: {selectedUser?.id})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isTriggering}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTriggerRefresh}
              disabled={isTriggering}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isTriggering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
