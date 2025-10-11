import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/services/api';
import { Basket, Fund, BasketFund } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const basketSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 year'),
});

type BasketFormData = z.infer<typeof basketSchema>;

interface BasketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basket: Basket | null;
  onSuccess: () => void;
}

export function BasketDialog({ open, onOpenChange, basket, onSuccess }: BasketDialogProps) {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [basketFunds, setBasketFunds] = useState<BasketFund[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);

  const form = useForm<BasketFormData>({
    resolver: zodResolver(basketSchema),
    defaultValues: {
      name: '',
      category: '',
      duration: 5,
    },
  });

  useEffect(() => {
    const fetchFunds = async () => {
      const data = await api.getFunds();
      setFunds(data);
    };
    fetchFunds();
  }, []);

  useEffect(() => {
    if (basket) {
      form.reset({
        name: basket.name,
        category: basket.category,
        duration: basket.duration,
      });
      setBasketFunds(basket.funds);
    } else {
      form.reset({
        name: '',
        category: '',
        duration: 5,
      });
      setBasketFunds([]);
    }
  }, [basket, form]);

  useEffect(() => {
    const total = basketFunds.reduce((sum, f) => sum + f.percentage, 0);
    setTotalPercentage(total);
  }, [basketFunds]);

  const handleAddFund = () => {
    if (funds.length > 0) {
      setBasketFunds([
        ...basketFunds,
        { fundId: funds[0].id, fundName: funds[0].name, percentage: 0 },
      ]);
    }
  };

  const handleRemoveFund = (index: number) => {
    setBasketFunds(basketFunds.filter((_, i) => i !== index));
  };

  const handleFundChange = (index: number, fundId: string) => {
    const fund = funds.find((f) => f.id === fundId);
    if (fund) {
      const newFunds = [...basketFunds];
      newFunds[index] = { ...newFunds[index], fundId, fundName: fund.name };
      setBasketFunds(newFunds);
    }
  };

  const handlePercentageChange = (index: number, percentage: number) => {
    const newFunds = [...basketFunds];
    newFunds[index] = { ...newFunds[index], percentage };
    setBasketFunds(newFunds);
  };

  const onSubmit = async (data: BasketFormData) => {
    if (basketFunds.length === 0) {
      toast.error('Please add at least one fund');
      return;
    }

    if (totalPercentage !== 100) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    try {
      const basketData: Omit<Basket, 'id' | 'createdAt'> = {
        name: data.name,
        category: data.category,
        duration: data.duration,
        funds: basketFunds,
        totalPercentage,
      };

      if (basket) {
        await api.updateBasket(basket.id, basketData);
        toast.success('Basket updated successfully');
      } else {
        await api.createBasket(basketData);
        toast.success('Basket created successfully');
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
      setBasketFunds([]);
    } catch (error) {
      toast.error('Failed to save basket');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{basket ? 'Edit Basket' : 'Add Basket'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter basket name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low Risk">Low Risk</SelectItem>
                      <SelectItem value="Medium Risk">Medium Risk</SelectItem>
                      <SelectItem value="High Risk">High Risk</SelectItem>
                      <SelectItem value="Balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (years)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Funds Allocation</FormLabel>
                <Button type="button" size="sm" variant="outline" onClick={handleAddFund}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Fund
                </Button>
              </div>

              {basketFunds.map((basketFund, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      value={basketFund.fundId}
                      onValueChange={(value) => handleFundChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {funds.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="%"
                      value={basketFund.percentage || ''}
                      onChange={(e) =>
                        handlePercentageChange(index, parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveFund(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total Allocation:</span>
                <span
                  className={`font-bold ${
                    totalPercentage === 100
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {totalPercentage}%
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={totalPercentage !== 100}>
                {basket ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
