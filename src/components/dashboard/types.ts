export interface DashboardComponentProps {
  loading?: boolean;
  className?: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  onClick?: () => void;
}

export interface SectionCardData {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  onClick?: () => void;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  location?: string;
  description?: string;
  type: 'trial' | 'meeting' | 'deadline' | 'other';
  onClick?: () => void;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  matchPercentage?: number;
  type: 'researcher' | 'publication' | 'trial';
  icon: React.ReactNode;
  onClick: () => void;
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}