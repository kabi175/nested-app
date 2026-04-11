"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Activity, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { triggerSipTransactionTracker } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function TriggerSipTrackerPage() {
  const { toast } = useToast();
  const [orderRef, setOrderRef] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleTrigger = async () => {
    setIsTriggering(true);
    setIsConfirmDialogOpen(false);

    try {
      await triggerSipTransactionTracker(orderRef.trim());
      toast({
        title: 'Success',
        description: `SIP transaction tracker triggered for order ref: ${orderRef.trim()}`,
      });
      setOrderRef('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to trigger SIP transaction tracker',
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
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                Trigger SIP Transaction Tracker
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Manually trigger tracking for a SIP order item ref
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                SIP Order Ref
              </CardTitle>
              <CardDescription>
                Enter the SIP order item ref to trigger the transaction tracker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-ref">Order Ref</Label>
                <Input
                  id="order-ref"
                  placeholder="e.g. MFP123456"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 rounded-xl h-11"
                />
              </div>

              <Button
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={!orderRef.trim() || isTriggering}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Trigger Tracker
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30 max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                About This Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                This immediately schedules a <strong>SipTransactionTracker</strong> job for the
                given SIP order item ref. Use this to unblock a stuck SIP order in production —
                for example when a new installment cycle was missed by the daily scheduler.
                The tracker will fetch the latest transaction data from the provider and create
                installment records accordingly.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Trigger</DialogTitle>
            <DialogDescription>
              Are you sure you want to trigger the SIP transaction tracker for order ref{' '}
              <strong>{orderRef.trim()}</strong>?
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
              onClick={handleTrigger}
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
