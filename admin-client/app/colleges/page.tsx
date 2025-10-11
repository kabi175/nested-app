"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Download, 
  Building,
  MapPin,
  DollarSign,
  BookOpen,
  TrendingUp,
  Filter
} from "lucide-react";

// Mock data - replace with actual API calls
const colleges = [
  {
    id: "1",
    name: "MIT",
    location: "Cambridge, MA",
    fees: 75000,
    course: "Computer Science",
    duration: 4,
    category: "Engineering",
    type: "University",
    country: "USA",
  },
  {
    id: "2",
    name: "Stanford University",
    location: "Stanford, CA",
    fees: 78000,
    course: "Engineering",
    duration: 4,
    category: "Engineering",
    type: "University",
    country: "USA",
  },
  {
    id: "3",
    name: "Harvard University",
    location: "Cambridge, MA",
    fees: 82000,
    course: "Business Administration",
    duration: 4,
    category: "Business",
    type: "University",
    country: "USA",
  },
  {
    id: "4",
    name: "Oxford University",
    location: "Oxford, UK",
    fees: 45000,
    course: "Liberal Arts",
    duration: 3,
    category: "Liberal Arts",
    type: "University",
    country: "UK",
  },
];

export default function CollegesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || college.category === categoryFilter;
    const matchesType = typeFilter === "all" || college.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const stats = {
    total: colleges.length,
    universities: colleges.filter(c => c.type === "University").length,
    courses: new Set(colleges.map(c => c.course)).size,
    avgFees: Math.round(colleges.reduce((sum, c) => sum + c.fees, 0) / colleges.length),
  };

  const handleEdit = (college) => {
    setEditingCollege(college);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCollege(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            College Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage colleges and educational institutions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add College
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Universities</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.universities}</div>
            <p className="text-xs text-muted-foreground">Higher education</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">Different programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual tuition</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges, courses, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Engineering">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Engineering
                  </div>
                </SelectItem>
                <SelectItem value="Business">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Business
                  </div>
                </SelectItem>
                <SelectItem value="Liberal Arts">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Liberal Arts
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Institution Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="University">University</SelectItem>
                <SelectItem value="College">College</SelectItem>
                <SelectItem value="Institute">Institute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Colleges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Colleges ({filteredColleges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Annual Fees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColleges.map((college) => (
                  <TableRow key={college.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {college.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{college.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {college.type}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{college.course}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {college.category === "Engineering" && <Building className="h-4 w-4 text-blue-600" />}
                        {college.category === "Business" && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {college.category === "Liberal Arts" && <BookOpen className="h-4 w-4 text-purple-600" />}
                        <span>{college.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {college.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{college.duration} years</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${college.fees.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(college)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit College Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCollege ? 'Edit College' : 'Create New College'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">College Name</Label>
              <Input
                id="name"
                placeholder="Enter college name"
                defaultValue={editingCollege?.name || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                placeholder="Enter course name"
                defaultValue={editingCollege?.course || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location"
                defaultValue={editingCollege?.location || ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (years)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="4"
                  defaultValue={editingCollege?.duration || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fees">Annual Fees ($)</Label>
                <Input
                  id="fees"
                  type="number"
                  placeholder="75000"
                  defaultValue={editingCollege?.fees || ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={editingCollege?.category || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Liberal Arts">Liberal Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={editingCollege?.type || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="University">University</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Institute">Institute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              {editingCollege ? 'Update College' : 'Create College'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
