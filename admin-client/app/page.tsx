import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  Package, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Calendar,
  Target,
  Zap
} from "lucide-react";

// Mock data - replace with actual API calls
const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Active Colleges",
    value: "156",
    change: "+8.2%",
    trend: "up" as const,
    icon: GraduationCap,
    bgColor: "bg-green-50 dark:bg-green-950/20",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Investment Baskets",
    value: "89",
    change: "-2.1%",
    trend: "down" as const,
    icon: Package,
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "Total AUM",
    value: "$12.4M",
    change: "+15.8%",
    trend: "up" as const,
    icon: TrendingUp,
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "user",
    message: "New user registration: Sarah Johnson",
    time: "2 minutes ago",
    icon: Users,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    id: 2,
    type: "investment",
    message: "Investment basket created: Tech Growth Fund",
    time: "15 minutes ago",
    icon: Package,
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    id: 3,
    type: "college",
    message: "New college added: Stanford University",
    time: "1 hour ago",
    icon: GraduationCap,
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  {
    id: 4,
    type: "investment",
    message: "Portfolio rebalancing completed",
    time: "2 hours ago",
    icon: TrendingUp,
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
  },
];

const quickStats = [
  { label: "User Growth", value: 78, target: 100 },
  { label: "Goal Completion", value: 65, target: 100 },
  { label: "Platform Uptime", value: 99.9, target: 100 },
  { label: "Customer Satisfaction", value: 92, target: 100 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Welcome to your admin portal</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className={`absolute inset-0 ${stat.bgColor} opacity-50`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="flex items-center text-sm">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full ${activity.bgColor}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quickStats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stat.label}</span>
                  <span className="text-muted-foreground">{stat.value}%</span>
                </div>
                <Progress value={stat.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
