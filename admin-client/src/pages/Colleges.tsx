import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { College } from '@/types';
import { CollegeDialog } from '@/components/CollegeDialog';
import { toast } from 'sonner';

export default function Colleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const data = await api.getColleges();
      setColleges(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this college?')) {
      try {
        await api.deleteCollege(id);
        toast.success('College deleted successfully');
        fetchColleges();
      } catch (error) {
        toast.error('Failed to delete college');
      }
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCollege(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">College Management</h1>
          <p className="text-muted-foreground mt-1">Manage colleges and their fees</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add College
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Colleges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Fees (Annual)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : colleges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No colleges found</TableCell>
                  </TableRow>
                ) : (
                  colleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell className="font-medium">{college.name}</TableCell>
                      <TableCell>{college.location}</TableCell>
                      <TableCell>{college.course}</TableCell>
                      <TableCell>{college.duration} years</TableCell>
                      <TableCell>${college.fees.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(college)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(college.id)}
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

      <CollegeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        college={editingCollege}
        onSuccess={fetchColleges}
      />
    </div>
  );
}
