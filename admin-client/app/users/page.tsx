"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  UserPlus, 
  Download, 
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Package
} from "lucide-react";

// Mock data - replace with actual API calls
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    totalFunds: 50000,
    activeGoals: 3,
    joinedDate: "2024-01-15",
    kycStatus: "approved",
    role: "user",
    location: "New York, NY",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567891",
    totalFunds: 75000,
    activeGoals: 2,
    joinedDate: "2024-02-20",
    kycStatus: "pending",
    role: "user",
    location: "Los Angeles, CA",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1234567892",
    totalFunds: 120000,
    activeGoals: 4,
    joinedDate: "2024-01-05",
    kycStatus: "approved",
    role: "premium",
    location: "Chicago, IL",
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKyc = kycFilter === "all" || user.kycStatus === kycFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesKyc && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.kycStatus === "approved").length,
    kycApproved: users.filter(u => u.kycStatus === "approved").length,
    pendingKyc: users.filter(u => u.kycStatus === "pending").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage and monitor user accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">KYC approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Approved</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Verified</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kycApproved}</div>
            <p className="text-xs text-muted-foreground">85% approval rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingKyc}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="User Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Funds</TableHead>
                  <TableHead>Active Goals</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${user.totalFunds.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.activeGoals}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.kycStatus === "approved" ? "default" : "secondary"}
                        className={
                          user.kycStatus === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {user.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedUser(user)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <Badge 
                    variant={selectedUser.kycStatus === "approved" ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {selectedUser.kycStatus}
                  </Badge>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedUser.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedUser.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedUser.location}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Account Details</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Total Funds: <span className="font-medium text-foreground">${selectedUser.totalFunds.toLocaleString()}</span></div>
                    <div>Active Goals: <span className="font-medium text-foreground">{selectedUser.activeGoals}</span></div>
                    <div>Role: <span className="font-medium text-foreground capitalize">{selectedUser.role}</span></div>
                    <div>Joined: <span className="font-medium text-foreground">{new Date(selectedUser.joinedDate).toLocaleDateString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Mock Investment Goals */}
              <div className="space-y-3">
                <h4 className="font-medium">Investment Goals</h4>
                <div className="space-y-2">
                  {["Education Fund", "Retirement Plan", "Home Purchase"].map((goal, index) => (
                    <div key={goal} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{goal}</div>
                        <div className="text-sm text-muted-foreground">Target: ${(50000 + index * 25000).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${(15000 + index * 8000).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{30 + index * 20}% funded</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Holdings */}
              <div className="space-y-3">
                <h4 className="font-medium">Current Holdings</h4>
                <div className="grid grid-cols-2 gap-3">
                  {["Tech Growth Fund", "Balanced Portfolio", "International Fund", "Bond Fund"].map((holding, index) => (
                    <div key={holding} className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-sm">{holding}</div>
                      <div className="text-xs text-muted-foreground">${(5000 + index * 2000).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
