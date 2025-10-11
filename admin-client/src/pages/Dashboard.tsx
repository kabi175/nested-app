import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Package, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalColleges: 0,
    totalBaskets: 0,
    totalFunds: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [users, colleges, baskets, funds] = await Promise.all([
        api.getUsers(),
        api.getColleges(),
        api.getBaskets(),
        api.getFunds(),
      ]);
      setStats({
        totalUsers: users.length,
        totalColleges: colleges.length,
        totalBaskets: baskets.length,
        totalFunds: funds.length,
      });
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
    { title: 'Colleges', value: stats.totalColleges, icon: GraduationCap, color: 'text-green-600' },
    { title: 'Baskets', value: stats.totalBaskets, icon: Package, color: 'text-purple-600' },
    { title: 'Available Funds', value: stats.totalFunds, icon: TrendingUp, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin portal</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the sidebar to navigate between different sections of the admin portal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
