import {
    Settings,
    PieChart,
    AudioWaveform,
    ChevronRight,
    Sparkles,
    MessageSquare
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';

interface SidebarItemProps {
    icon?: React.ElementType;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
}

const SidebarItem = ({ icon: Icon, label, isActive, onClick, className }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center w-full px-4 py-2 text-sm font-medium transition-colors rounded-md",
            isActive
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            className
        )}
    >
        {Icon && <Icon className="w-4 h-4 mr-3" />}
        {label}
    </button>
);

interface MindSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    activeSection: string;
    onSectionChange: (section: string) => void;
}

const MindSidebar = ({
    activeTab,
    onTabChange,
    activeSection,
    onSectionChange,
}: MindSidebarProps) => {
    const navigate = useNavigate();

    return (
        <div className="w-64 h-full border-r bg-background flex flex-col">
            {/* Top Tabs */}
            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <button
                        onClick={() => onTabChange('content')}
                        className={cn(
                            "flex items-center w-full px-2 py-1.5 text-sm font-medium transition-colors rounded-md",
                            activeTab === 'content' ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <PieChart className="w-4 h-4 mr-2" />
                        Content
                    </button>
                    <button
                        onClick={() => onTabChange('voice')}
                        className={cn(
                            "flex items-center w-full px-2 py-1.5 text-sm font-medium transition-colors rounded-md",
                            activeTab === 'voice' ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <AudioWaveform className="w-4 h-4 mr-2" />
                        Voice
                    </button>
                </div>

                {/* Clone Selector */}
                <Select defaultValue="main-clone">
                    <SelectTrigger className="w-full">
                        <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 mr-2" />
                            <SelectValue placeholder="Select Clone" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="main-clone">Main Clone</SelectItem>
                        <SelectItem value="clone-2">Clone 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <ScrollArea className="flex-1 px-2">
                <div className="space-y-6 py-2">
                    {/* Identity Section */}
                    <div className="space-y-1">
                        <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Identity
                        </h3>
                        <SidebarItem
                            label="Profile"
                            isActive={activeSection === 'profile'}
                            onClick={() => onSectionChange('profile')}
                        />
                        <SidebarItem
                            label="Biography"
                            isActive={activeSection === 'biography'}
                            onClick={() => onSectionChange('biography')}
                        />
                        <SidebarItem
                            label="Social Links"
                            isActive={activeSection === 'social-links'}
                            onClick={() => onSectionChange('social-links')}
                        />
                    </div>

                    {/* Behavior Section */}
                    <div className="space-y-1">
                        <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Behavior
                        </h3>
                        <SidebarItem
                            label="Purpose & Instructions"
                            isActive={activeSection === 'purpose'}
                            onClick={() => onSectionChange('purpose')}
                        />
                        <SidebarItem
                            label="Speaking Style"
                            isActive={activeSection === 'speaking-style'}
                            onClick={() => onSectionChange('speaking-style')}
                        />
                        <SidebarItem
                            label="Response Settings"
                            isActive={activeSection === 'response-settings'}
                            onClick={() => onSectionChange('response-settings')}
                        />
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-1">
                        <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Appearance
                        </h3>
                        <SidebarItem
                            label="Suggested Questions"
                            isActive={activeSection === 'suggested-questions'}
                            onClick={() => onSectionChange('suggested-questions')}
                        />
                        <SidebarItem
                            label="Experience Settings"
                            isActive={activeSection === 'experience-settings'}
                            onClick={() => onSectionChange('experience-settings')}
                        />
                    </div>

                    {/* Clone Quality */}
                    <div className="px-4 pt-4">
                        <div
                            onClick={() => onSectionChange('clone-quality')}
                            className={cn(
                                "p-4 border rounded-xl space-y-3 cursor-pointer transition-colors",
                                activeSection === 'clone-quality'
                                    ? "border-orange-200 bg-orange-50"
                                    : "hover:bg-muted/50"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Clone Quality</span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-orange-500 font-medium">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Legendary</span>
                                </div>
                                <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-orange-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Bottom Actions */}
            <div className="p-4 border-t space-y-1">
                <Link
                    to="/talk-to-delphi"
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Talk to Your Delphi
                </Link>
                <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                </button>
            </div>
        </div>
    );
};

export default MindSidebar;
