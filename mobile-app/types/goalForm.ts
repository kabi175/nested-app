import { Education } from "./education";

export interface GoalForm {
  id: string;
  type: "undergraduate" | "postgraduate";
  title: string;
  degree: string;
  college: string;
  currentCost: number;
  targetYear: number;
  futureCost: number;
  selectionMode: "course" | "college";
  education?: Education;
  childId: string | null;
}

