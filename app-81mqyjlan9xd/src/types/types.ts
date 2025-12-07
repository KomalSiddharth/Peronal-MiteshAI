export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  source_type: string;
  word_count: number;
  file_url: string | null;
  folder_id: string | null;
  status: 'active' | 'failed';
  uploaded_at: string;
  metadata: Record<string, any>;
}

export interface AudienceUser {
  id: string;
  name: string;
  email: string | null;
  tags: string[];
  message_count: number;
  status: 'active' | 'invited' | 'revoked';
  last_active: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  last_message_at: string | null;
  message_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  is_answered: boolean;
  created_at: string;
}

export interface AnalyticsMetric {
  id: string;
  date: string;
  total_conversations: number;
  active_users: number;
  time_created_minutes: number;
  messages_answered: number;
  messages_unanswered: number;
  created_at: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string | null;
  action_text: string | null;
  created_at: string;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  mention_count: number;
  period_start: string;
  period_end: string;
}

export interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}
