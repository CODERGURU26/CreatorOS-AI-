export type CreatorType =
  | "Music"
  | "Anime"
  | "Quotes"
  | "Motivation"
  | "Business"
  | "Gym"
  | "Travel"
  | "Fashion"
  | "Finance"
  | "Technology"
  | "Education"
  | "Gaming"
  | "Lifestyle";

export type PlatformType =
  | "Instagram"
  | "TikTok"
  | "YouTube Shorts"
  | "Facebook"
  | "LinkedIn"
  | "Pinterest"
  | "Threads";

export type GoalType =
  | "More Followers"
  | "More Reach"
  | "More Revenue"
  | "Affiliate Sales"
  | "Brand Deals"
  | "Personal Brand";

export interface OnboardingData {
  creatorType: CreatorType;
  platforms: PlatformType[];
  goals: GoalType[];
  isCompleted: boolean;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  text: string;
  agentId: string;
  status: "idle" | "running" | "success" | "warning";
}

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  trend: number[]; // Sparkline data points
  status?: "LIVE" | "SYNCING" | "UNAVAILABLE";
  details?: string;
}

export interface CalendarEntry {
  day: number;
  time: string;
  topic: string;
  format: string;
  mixType: string;
  description: string;
  status: "draft" | "scheduled" | "published";
}

export interface CaptionOption {
  style: string;
  content: string;
  cta: string;
}

export interface HashtagRecipe {
  trending: string[];
  mediumCompetition: string[];
  evergreen: string[];
  highConversion: string[];
  analyticsHook: string;
}

export interface ViralReel {
  hook: string;
  views: string;
  reasonForViral: string;
}

export interface CompetitorReport {
  username: string;
  postingFrequency: string;
  estimatedEngagement: string;
  topViralReels: ViralReel[];
  topHashtags: string[];
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
}

export interface AICeoReport {
  salutation: string;
  metrics: {
    followers: string;
    views: string;
    reach: string;
    bestReel: string;
  };
  recommendations: string[];
  expectedWeeklyReach: string;
  todaysTasks: string[];
  _isSimulated?: boolean;
  _simulationReason?: string;
}
