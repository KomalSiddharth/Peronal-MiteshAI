import { supabase } from './supabase';
import type {
  Folder,
  ContentItem,
  AudienceUser,
  Conversation,
  Message,
  AnalyticsMetric,
  Insight,
  TrendingTopic,
} from '@/types/types';

// Mind Profile API
export const getMindProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('mind_profile')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  return data;
};

export const updateMindProfile = async (profile: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('mind_profile')
    .upsert({
      user_id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Folders API
export const getFolders = async (): Promise<Folder[]> => {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createFolder = async (name: string, parent_id: string | null = null): Promise<Folder> => {
  const { data, error } = await supabase
    .from('folders')
    .insert({ name, parent_id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Content Items API
export const getContentItems = async (folderId?: string): Promise<ContentItem[]> => {
  let query = supabase
    .from('content_items')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (folderId) {
    query = query.eq('folder_id', folderId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getFailedContentCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('content_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  if (error) throw error;
  return count || 0;
};

export const getTotalWordCount = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('content_items')
    .select('word_count');

  if (error) throw error;
  const items = Array.isArray(data) ? data : [];
  return items.reduce((sum, item) => sum + (item.word_count || 0), 0);
};

export const createContentItem = async (item: Partial<ContentItem>): Promise<ContentItem> => {
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      title: item.title || 'Untitled',
      source_type: item.source_type || 'Document',
      word_count: item.word_count || 0,
      file_url: item.file_url || null,
      folder_id: item.folder_id || null,
      status: item.status || 'active',
      metadata: item.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteContentItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Audience Users API
export const getAudienceUsers = async (status?: string): Promise<AudienceUser[]> => {
  let query = supabase
    .from('audience_users')
    .select('*')
    .order('last_active', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getTotalUserCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('audience_users')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
};

export const createAudienceUser = async (user: Partial<AudienceUser>): Promise<AudienceUser> => {
  const { data, error } = await supabase
    .from('audience_users')
    .insert({
      name: user.name || 'Unknown',
      email: user.email || null,
      tags: user.tags || [],
      message_count: user.message_count || 0,
      status: user.status || 'active',
      last_active: user.last_active || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Alias for createAudienceUser
export const addAudienceMember = createAudienceUser;

// Analytics API
export const getAnalyticsMetrics = async (days: number = 7): Promise<AnalyticsMetric[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('analytics_metrics')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getLatestMetrics = async (): Promise<AnalyticsMetric | null> => {
  const { data, error } = await supabase
    .from('analytics_metrics')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Insights API
export const getInsights = async (limit: number = 5): Promise<Insight[]> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

// Trending Topics API
export const getTrendingTopics = async (days: number = 7): Promise<TrendingTopic[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .gte('period_start', startDate.toISOString())
    .order('mention_count', { ascending: false })
    .limit(10);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

// Conversations API
export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

// Messages API
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};
