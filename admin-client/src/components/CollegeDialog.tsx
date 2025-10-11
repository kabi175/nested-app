import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { api } from '@/services/api';
import { College } from '@/types';
import { toast } from 'sonner';

const collegeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  course: z.string().min(1, 'Course is required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 year'),
  fees: z.coerce.number().min(0, 'Fees must be a positive number'),
});

type CollegeFormData = z.infer<typeof collegeSchema>;

interface CollegeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  college: College | null;
  onSuccess: () => void;
}

export function CollegeDialog({ open, onOpenChange, college, onSuccess }: CollegeDialogProps) {
  const form = useForm<CollegeFormData>({
    resolver: zodResolver(collegeSchema),
    defaultValues: {
      name: '',
      location: '',
      course: '',
      duration: 4,
      fees: 0,
    },
  });

  useEffect(() => {
    if (college) {
      form.reset(college);
    } else {
      form.reset({
        name: '',
        location: '',
        course: '',
        duration: 4,
        fees: 0,
      });
    }
  }, [college, form]);

  const onSubmit = async (data: CollegeFormData) => {
    try {
      const collegeData: Omit<College, 'id'> = {
        name: data.name,
        location: data.location,
        course: data.course,
        duration: data.duration,
        fees: data.fees,
      };

      if (college) {
        await api.updateCollege(college.id, collegeData);
        toast.success('College updated successfully');
      } else {
        await api.createCollege(collegeData);
        toast.success('College created successfully');
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to save college');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{college ? 'Edit College' : 'Add College'}</DialogTitle>
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
                    <Input placeholder="Enter college name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Fees ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {college ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
