import {
  Activity,
  BarChart3,
  Building2,
  Clock,
  DollarSign,
  FileText,
  Globe,
  PieChart,
  Shield,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react-native";

export type FundIconType =
  | "shield"
  | "file"
  | "clock"
  | "trending"
  | "pie"
  | "target"
  | "dollar"
  | "bar"
  | "activity"
  | "building"
  | "globe"
  | "zap";

export const FUND_ICONS: FundIconType[] = [
  "shield",
  "file",
  "clock",
  "trending",
  "pie",
  "target",
  "dollar",
  "bar",
  "activity",
  "building",
  "globe",
  "zap",
];

export const getIconComponent = (iconType: FundIconType): LucideIcon => {
  const iconMap: Record<FundIconType, LucideIcon> = {
    shield: Shield,
    file: FileText,
    clock: Clock,
    trending: TrendingUp,
    pie: PieChart,
    target: Target,
    dollar: DollarSign,
    bar: BarChart3,
    activity: Activity,
    building: Building2,
    globe: Globe,
    zap: Zap,
  };

  return iconMap[iconType];
};

export const getIconForIndex = (index: number): FundIconType => {
  return FUND_ICONS[index % FUND_ICONS.length];
};
