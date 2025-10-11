import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { Basket } from '@/types';
import { BasketDialog } from '@/components/BasketDialog';
import { toast } from 'sonner';

export default function Baskets() {
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBasket, setEditingBasket] = useState<Basket | null>(null);

  useEffect(() => {
    fetchBaskets();
  }, []);

  const fetchBaskets = async () => {
    setLoading(true);
    try {
      const data = await api.getBaskets();
      setBaskets(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this basket?')) {
      try {
        await api.deleteBasket(id);
        toast.success('Basket deleted successfully');
        fetchBaskets();
      } catch (error) {
        toast.error('Failed to delete basket');
      }
    }
  };

  const handleEdit = (basket: Basket) => {
    setEditingBasket(basket);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingBasket(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Basket Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage investment baskets</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Basket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Baskets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Funds</TableHead>
                  <TableHead>Allocation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : baskets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No baskets found</TableCell>
                  </TableRow>
                ) : (
                  baskets.map((basket) => (
                    <TableRow key={basket.id}>
                      <TableCell className="font-medium">{basket.name}</TableCell>
                      <TableCell>{basket.category}</TableCell>
                      <TableCell>{basket.duration} years</TableCell>
                      <TableCell>{basket.funds.length} funds</TableCell>
                      <TableCell>
                        <span className={basket.totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}>
                          {basket.totalPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(basket)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(basket.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <BasketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        basket={editingBasket}
        onSuccess={fetchBaskets}
      />
    </div>
  );
}
