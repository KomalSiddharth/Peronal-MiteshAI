import { useEffect, useState } from 'react';
import { Search, AlertCircle, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import MindSidebar from '@/components/mind/MindSidebar';
import FolderSidebar from '@/components/mind/FolderSidebar';
import ContentList from '@/components/mind/ContentList';
import ProfileView from '@/components/mind/sections/ProfileView';
import BiographyView from '@/components/mind/sections/BiographyView';
import SocialLinksView from '@/components/mind/sections/SocialLinksView';
import PurposeInstructionsView from '@/components/mind/sections/PurposeInstructionsView';
import SpeakingStyleView from '@/components/mind/sections/SpeakingStyleView';
import ResponseSettingsView from '@/components/mind/sections/ResponseSettingsView';
import SuggestedQuestionsView from '@/components/mind/sections/SuggestedQuestionsView';
import ExperienceSettingsView from '@/components/mind/sections/ExperienceSettingsView';
import CloneQualityView from '@/components/mind/sections/CloneQualityView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  getContentItems,
  getFolders,
  getFailedContentCount,
  getTotalWordCount,
  deleteContentItem,
  createFolder,
} from '@/db/api';
import type { ContentItem, Folder } from '@/types/types';
import { supabase } from '@/db/supabase';

const MindPage = () => {
  const [loading, setLoading] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [failedCount, setFailedCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState('profile');

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedFolder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [items, foldersList, failed, words] = await Promise.all([
        getContentItems(selectedFolder || undefined),
        getFolders(),
        getFailedContentCount(),
        getTotalWordCount(),
      ]);

      setContentItems(items);
      setFolders(foldersList);
      setFailedCount(failed);
      setTotalWords(words);
    } catch (error) {
      console.error('Error fetching content data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContentItem(id);
      toast({
        title: 'Success',
        description: 'Content deleted successfully.',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName);
      setNewFolderName('');
      toast({
        title: 'Success',
        description: 'Folder created successfully.',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create folder.',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadContent.trim()) return;

    try {
      setIsUploading(true);
      const { error } = await supabase.functions.invoke('ingest-content', {
        body: {
          content: uploadContent,
          metadata: {
            type: 'text',
            source: 'user-upload',
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content uploaded to Knowledge Base successfully.',
      });
      setUploadContent('');
      setIsUploadDialogOpen(false);
      fetchData(); // Refresh content list if we were showing it (though ingest might not immediately show up in the list if it's just vector store, but good practice)
    } catch (error) {
      console.error('Error uploading content:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredItems = contentItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    // If activeTab is NOT content (e.g. voice), or if activeTab IS content but we selected a section
    // Wait, the logic should be:
    // Top tabs: Content, Voice
    // Sidebar sections: Identity (Profile, Bio, Social), Behavior, Appearance

    // If user clicks "Content" top tab, we show the file explorer.
    // If user clicks a sidebar section, we show that section.

    // Let's assume:
    // activeTab = 'content' | 'voice'
    // activeSection = 'profile' | 'biography' | ...

    // If activeTab is 'content' AND no specific section is "active" in a way that overrides content...
    // Actually, the sidebar has "Content" and "Voice" as top tabs, and then a list of sections below.
    // The "Content" top tab seems to trigger the file explorer view.
    // The sections below trigger their specific views.

    // So if activeTab === 'content', we show the file explorer?
    // But the sidebar structure implies the sections are always visible.
    // Let's look at the behavior:
    // Clicking "Content" top tab -> Shows file explorer (FolderSidebar + ContentList)
    // Clicking "Profile" -> Shows ProfileView

    // So we can use a single state variable or a combination.
    // Let's say when "Content" is clicked, we set activeSection to null or 'content-explorer'.

    if (activeTab === 'content') {
      return (
        <>
          {/* Middle Sidebar - Folders */}
          <div className="w-64 border-r bg-background/50">
            <Dialog>
              <DialogTrigger asChild>
                <div className="h-full">
                  <FolderSidebar
                    folders={folders}
                    selectedFolder={selectedFolder}
                    onSelectFolder={setSelectedFolder}
                    onCreateFolder={() => { }}
                  />
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                    />
                  </div>
                  <Button onClick={handleCreateFolder} className="w-full">
                    Create Folder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-background">
            <div className="container p-8 space-y-6">
              {/* Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                      <div className="p-1 border rounded bg-background">
                        <div className="w-4 h-4 bg-muted-foreground/20" />
                      </div>
                      <span>All Content</span>
                    </div>
                    {failedCount > 0 && (
                      <Badge variant="destructive" className="gap-1 bg-red-500 hover:bg-red-600 border-none">
                        <AlertCircle className="h-3 w-3" />
                        {failedCount} Failed Documents
                      </Badge>
                    )}
                  </div>

                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-black text-white hover:bg-black/90 rounded-full px-6">
                        Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Content</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Add Text Content</Label>
                          <Textarea
                            placeholder="Paste text, articles, or notes here..."
                            className="min-h-[200px]"
                            value={uploadContent}
                            onChange={(e) => setUploadContent(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            This content will be added to your Knowledge Base and used to answer questions.
                          </p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpload} disabled={isUploading || !uploadContent.trim()}>
                            {isUploading ? 'Processing...' : 'Add to Knowledge Base'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-full bg-muted/30 border-muted-foreground/20"
                      />
                    </div>
                    <Button variant="outline" className="rounded-full border-muted-foreground/20 gap-2">
                      Edit Filters
                      <Filter className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredItems.length} of {totalWords.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Content List */}
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[400px] bg-muted" />
                </div>
              ) : (
                <>
                  <ContentList items={filteredItems} onDelete={handleDelete} />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Showing {filteredItems.length} of {contentItems.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      );
    }

    // Render other sections
    return (
      <div className="flex-1 overflow-auto bg-background">
        {activeSection === 'profile' && <ProfileView />}
        {activeSection === 'biography' && <BiographyView />}
        {activeSection === 'social-links' && <SocialLinksView />}
        {activeSection === 'purpose' && <PurposeInstructionsView />}
        {activeSection === 'speaking-style' && <SpeakingStyleView />}
        {activeSection === 'response-settings' && <ResponseSettingsView />}
        {activeSection === 'suggested-questions' && <SuggestedQuestionsView />}
        {activeSection === 'experience-settings' && <ExperienceSettingsView />}
        {activeSection === 'clone-quality' && <CloneQualityView />}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        <MindSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'content') {
              setActiveSection(''); // Clear active section when going to content explorer
            }
          }}
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setActiveTab('settings'); // Switch away from 'content' tab when a section is selected
          }}
        />
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default MindPage;
