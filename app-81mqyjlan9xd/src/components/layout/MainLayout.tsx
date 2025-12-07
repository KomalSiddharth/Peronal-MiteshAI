import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tabs = [
    { name: 'Insights', path: '/insights' },
    { name: 'Mind', path: '/mind' },
    { name: 'Access', path: '/access' },
    { name: 'Advanced', path: '/advanced' },
  ];

  const isActiveTab = (path: string) => {
    return location.pathname === path || (path === '/insights' && location.pathname === '/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="flex h-16 items-center px-4 xl:px-6">
          {/* Logo and User Name */}
          <div className="flex items-center gap-3 mr-8">
            <img
              src="https://miaoda-conversation-file.s3cdn.medo.dev/user-7nqges6yla0w/conv-81mqyjlan9xc/20251206/file-81ndgdtyydq8.png"
              alt="MK Logo"
              className="w-10 h-10 rounded-lg object-contain"
            />
            <span className="font-semibold text-foreground hidden xl:inline-block">
              Mitesh Khatri
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 mr-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveTab(tab.path)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="xl:hidden mr-auto p-2"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Search */}
          <div className="hidden xl:flex items-center gap-2 mr-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Find"
                className="pl-9 pr-12 w-64 bg-muted/50"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Publish Button */}
          <Button className="mr-4 hidden xl:inline-flex">Publish</Button>

          {/* Notifications and Profile */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isSidebarOpen && (
          <div className="xl:hidden border-t bg-card">
            <nav className="flex flex-col p-4 gap-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveTab(tab.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
              <div className="pt-2 border-t mt-2">
                <Button className="w-full">Publish</Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default MainLayout;
