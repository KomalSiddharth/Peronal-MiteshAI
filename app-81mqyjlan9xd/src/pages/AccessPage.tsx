import { useEffect, useState } from 'react';
import { Plus, Search, Filter as FilterIcon, Users, ExternalLink } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import UserTable from '@/components/access/UserTable';
import AddUsersDialog from '@/components/access/AddUsersDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAudienceUsers, getTotalUserCount } from '@/db/api';
import type { AudienceUser } from '@/types/types';

const AccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AudienceUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AudienceUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, count] = await Promise.all([
        getAudienceUsers(statusFilter),
        getTotalUserCount(),
      ]);

      setUsers(usersData);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const hiddenCount = totalCount - filteredUsers.length;

  return (
    <MainLayout>
      <div className="container mx-auto p-4 xl:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Audience</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{totalCount.toLocaleString()} Users</span>
              {hiddenCount > 0 && (
                <>
                  <span>•</span>
                  <span>{hiddenCount} users hidden by filters</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Sync CRM
            </Button>
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Users
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col xl:flex-row gap-4">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full xl:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="invited">Invited</TabsTrigger>
              <TabsTrigger value="revoked">Revoked</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <Skeleton className="h-[500px] bg-muted" />
        ) : (
          <UserTable users={filteredUsers} />
        )}

        {/* Add Users Dialog */}
        <AddUsersDialog
          open={isAddUserDialogOpen}
          onOpenChange={(open) => {
            setIsAddUserDialogOpen(open);
            if (!open) {
              // Refresh data when dialog closes
              fetchData();
            }
          }}
        />
      </div>
    </MainLayout>
  );
};

export default AccessPage;
