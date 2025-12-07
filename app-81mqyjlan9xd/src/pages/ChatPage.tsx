import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    Phone,
    History,
    MoreHorizontal,
    Paperclip,
    Mic,
    Send,
    X,
    ChevronRight,
    Link as LinkIcon,
    MessageSquare,
    ThumbsUp,
    Instagram,
    Linkedin,
    Facebook,
    Youtube,
    Globe,
    Plus,
    MessageCircle,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/db/supabase';

// Types
interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
}

interface HistoryItem {
    title: string;
    type: 'text';
    current?: boolean;
    messages: Message[];
}

interface HistoryGroup {
    date: string;
    items: HistoryItem[];
}

// Initial Mock Data
const INITIAL_HISTORY: HistoryGroup[] = [
    {
        date: 'November 30',
        items: [{
            title: 'Gratitude Lines Creation',
            type: 'text',
            messages: [
                { role: 'user', content: 'Help me create some gratitude lines.' },
                { role: 'assistant', content: 'Certainly! Here are some gratitude lines you can use...' }
            ]
        }]
    },
    {
        date: 'October 24',
        items: [{
            title: 'Top Health Affirmations',
            type: 'text',
            messages: [
                { role: 'user', content: 'What are some top health affirmations?' },
                { role: 'assistant', content: 'Here are some powerful health affirmations for you...' }
            ]
        }]
    },
    {
        date: 'October 2',
        items: [
            {
                title: 'Casual Greeting',
                type: 'text',
                current: true,
                messages: [
                    { role: 'user', content: 'Hi there!' },
                    { role: 'assistant', content: 'Hello! How can I help you today?' }
                ]
            },
            {
                title: 'Law of Attraction Webinar Registration',
                type: 'text',
                messages: [
                    { role: 'user', content: 'I want to register for the webinar.' },
                    { role: 'assistant', content: 'Great! You can register using this link...' }
                ]
            }
        ]
    }
];

const SOCIAL_LINKS = [
    { icon: Instagram, label: '@ miteshkhatri', color: 'text-pink-600' },
    { icon: Linkedin, label: '@ in/miteshkhatri', color: 'text-blue-700' },
    { icon: X, label: '@ iMiteshKhatri', color: 'text-black' },
    { icon: Facebook, label: '@ MiteshKhatriPage', color: 'text-blue-600' },
    { icon: Youtube, label: '@ MiteshKhatriLOA', color: 'text-red-600' },
    { icon: Globe, label: 'www.miteshkhatri.com', color: 'text-gray-600' },
];

const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hey, how's the Platinum Membership payment going? Need help with the balance or anything else, beta?" }
    ]);
    const [history, setHistory] = useState(INITIAL_HISTORY);

    // Dialog States
    const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
    const [actionView, setActionView] = useState<'main' | 'socials' | 'feedback'>('main');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isCallOpen, setIsCallOpen] = useState(false);

    // Call State
    const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // Load initial message if present
    useEffect(() => {
        if (location.state?.initialMessage) {
            const initialMsg = location.state.initialMessage;
            // Avoid adding duplicate if already added
            setMessages(prev => {
                if (prev.some(m => m.content === initialMsg && m.role === 'user')) return prev;
                return [...prev, { role: 'user', content: initialMsg }];
            });

            // Simulate AI response only if it's a new message
            setTimeout(() => {
                setMessages(prev => {
                    if (prev[prev.length - 1].role === 'assistant') return prev;
                    return [...prev, {
                        role: 'assistant',
                        content: "Hi Komal! How are you doing today? Let me know if there's anything specific you'd like help with—whether it's about courses, workshops, or anything else."
                    }];
                });
            }, 1000);

            // Clear state to prevent re-adding on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Auto-save on unmount
    useEffect(() => {
        return () => {
            saveCurrentConversation();
        };
    }, [messages]);

    const saveCurrentConversation = () => {
        if (messages.length <= 1) return; // Don't save if only initial greeting

        const firstUserMsg = messages.find(m => m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '') : 'New Conversation';

        setHistory(prev => {
            const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            const todayGroupIndex = prev.findIndex(g => g.date === 'Today' || g.date === today);

            // Create deep copy of messages to avoid reference issues
            const messagesToSave = JSON.parse(JSON.stringify(messages));
            const newItem: HistoryItem = { title, type: 'text', current: false, messages: messagesToSave };

            if (todayGroupIndex >= 0) {
                const newHistory = [...prev];
                // Check if already saved to avoid duplicates (simple check based on title)
                // In a real app, use unique IDs
                const existingItemIndex = newHistory[todayGroupIndex].items.findIndex(i => i.title === title);
                if (existingItemIndex === -1) {
                    newHistory[todayGroupIndex].items.unshift(newItem);
                } else {
                    // Update existing conversation
                    newHistory[todayGroupIndex].items[existingItemIndex] = newItem;
                }
                return newHistory;
            } else {
                return [{ date: 'Today', items: [newItem] }, ...prev];
            }
        });
    };

    const handleNewConversation = () => {
        saveCurrentConversation();
        setMessages([{ role: 'assistant', content: "Hey, how's the Platinum Membership payment going? Need help with the balance or anything else, beta?" }]);
        setIsHistoryOpen(false);
    };

    const handleLoadConversation = (item: HistoryItem) => {
        saveCurrentConversation(); // Save current before switching
        setMessages(item.messages);
        setIsHistoryOpen(false);
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = message;
        setMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-engine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ query: userMessage }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                        lastMessage.content += text;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm sorry, I encountered an error while processing your request. Please try again."
            }]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: `Sent an image: ${file.name}`,
                    image: result
                }]);

                // Simulate AI response
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: "I received your image. How can I help you with this?"
                    }]);
                }, 1000);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
                        <span>⌘</span> <span>Delphi</span>
                    </div>
                    <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                                <History className="w-4 h-4" />
                                <span className="hidden md:inline">Chat History</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
                                    <span>⌘</span> <span>Delphi</span>
                                </div>
                                {/* Close button is auto-added by Sheet */}
                            </div>
                            <ScrollArea className="h-[calc(100vh-65px)]">
                                <div className="p-4 space-y-6">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                                        onClick={handleNewConversation}
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Conversation
                                    </Button>

                                    {history.map((group, i) => (
                                        <div key={i} className="space-y-2">
                                            <h3 className="text-sm font-medium text-muted-foreground px-2">{group.date}</h3>
                                            <div className="space-y-1">
                                                {group.items.map((item, j) => (
                                                    <div
                                                        key={j}
                                                        className="group flex items-center justify-between px-2 py-2 hover:bg-muted rounded-lg cursor-pointer"
                                                        onClick={() => handleLoadConversation(item)}
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                            <span className={cn("text-sm truncate", item.current && "font-medium")}>
                                                                {item.title}
                                                            </span>
                                                            {item.current && (
                                                                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Current</span>
                                                            )}
                                                        </div>
                                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src="https://miaoda-conversation-file.s3cdn.medo.dev/user-7nqges6yla0w/conv-81mqyjlan9xc/20251206/file-81ndgdtyydq8.png" />
                        <AvatarFallback>MK</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">Mitesh Khatri</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsCallOpen(true)}>
                        <Phone className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                        K
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="max-w-3xl mx-auto space-y-6 py-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'assistant' && (
                                <Avatar className="w-8 h-8 mr-2 mt-1">
                                    <AvatarImage src="https://miaoda-conversation-file.s3cdn.medo.dev/user-7nqges6yla0w/conv-81mqyjlan9xc/20251206/file-81ndgdtyydq8.png" />
                                    <AvatarFallback>MK</AvatarFallback>
                                </Avatar>
                            )}
                            <div className="flex flex-col gap-2 max-w-[80%]">
                                {msg.image && (
                                    <img src={msg.image} alt="Uploaded" className="rounded-lg max-w-full h-auto border" />
                                )}
                                <div className={cn(
                                    "rounded-2xl px-4 py-3 text-sm",
                                    msg.role === 'user'
                                        ? "bg-orange-500 text-white rounded-br-none"
                                        : "bg-muted text-foreground rounded-bl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
                <div className="max-w-3xl mx-auto relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type..."
                            className="pl-12 pr-12 py-6 rounded-full bg-muted/50 border-muted-foreground/20"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                            <Mic className="w-5 h-5" />
                        </Button>
                    </div>

                    <Dialog open={isActionCenterOpen} onOpenChange={(open) => {
                        setIsActionCenterOpen(open);
                        if (!open) setActionView('main');
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                                <MoreHorizontal className="w-6 h-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0 rounded-2xl">
                            {actionView === 'main' && (
                                <>
                                    <DialogHeader className="p-4 pb-2">
                                        <DialogTitle>Action Center</DialogTitle>
                                        <p className="text-sm text-muted-foreground">Actions</p>
                                    </DialogHeader>
                                    <div className="p-4 space-y-2">
                                        <div
                                            className="flex items-center justify-between p-3 hover:bg-muted rounded-xl cursor-pointer transition-colors"
                                            onClick={() => setActionView('socials')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                    <LinkIcon className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">View Socials</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center justify-between p-3 hover:bg-muted rounded-xl cursor-pointer transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                    <MessageSquare className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">Get a Text</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div
                                            className="flex items-center justify-between p-3 hover:bg-muted rounded-xl cursor-pointer transition-colors"
                                            onClick={() => setActionView('feedback')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                                                    <ThumbsUp className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">Give feedback</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="p-4 text-center text-xs text-muted-foreground border-t">
                                        Powered by ⌘ Delphi
                                    </div>
                                </>
                            )}

                            {actionView === 'socials' && (
                                <>
                                    <DialogHeader className="p-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" onClick={() => setActionView('main')}>
                                                <ChevronRight className="w-4 h-4 rotate-180" />
                                            </Button>
                                            <DialogTitle>View Socials</DialogTitle>
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-6">Follow on</p>
                                    </DialogHeader>
                                    <div className="p-4 space-y-1">
                                        {SOCIAL_LINKS.map((link, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 hover:bg-muted rounded-xl cursor-pointer transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <link.icon className={cn("w-6 h-6", link.color)} />
                                                    <span className="font-medium text-sm">{link.label}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 text-center text-xs text-muted-foreground border-t">
                                        Powered by ⌘ Delphi
                                    </div>
                                </>
                            )}

                            {actionView === 'feedback' && (
                                <>
                                    <DialogHeader className="p-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" onClick={() => setActionView('main')}>
                                                <ChevronRight className="w-4 h-4 rotate-180" />
                                            </Button>
                                            <DialogTitle>User Feedback</DialogTitle>
                                        </div>
                                    </DialogHeader>
                                    <div className="p-6 space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            If you're experiencing any problems or have suggestions for improvement, please share your thoughts with us. The more specific information you provide, the better we can help.
                                        </p>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Subject</label>
                                            <Input className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Content</label>
                                            <Textarea className="min-h-[150px] bg-muted/50 resize-none" />
                                            <div className="text-right text-xs text-muted-foreground">0/1000</div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button className="bg-gray-500 hover:bg-gray-600 text-white rounded-full px-6">
                                                Confirm
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 text-center text-xs text-muted-foreground border-t">
                                        Powered by ⌘ Delphi
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Call Dialog */}
            <Dialog open={isCallOpen} onOpenChange={setIsCallOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start a Call</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 flex flex-col items-center gap-8">
                        <div className={cn(
                            "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
                            callStatus === 'listening' ? "bg-red-100 animate-pulse scale-110" :
                                callStatus === 'speaking' ? "bg-green-100 animate-bounce" :
                                    callStatus === 'processing' ? "bg-blue-100 animate-spin" :
                                        "bg-orange-100"
                        )}>
                            {callStatus === 'listening' ? <Mic className="w-12 h-12 text-red-500" /> :
                                callStatus === 'speaking' ? <Phone className="w-12 h-12 text-green-500" /> :
                                    callStatus === 'processing' ? <MoreHorizontal className="w-12 h-12 text-blue-500" /> :
                                        <Phone className="w-12 h-12 text-orange-500" />}
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold">
                                {callStatus === 'idle' ? 'Ready to Call' :
                                    callStatus === 'listening' ? 'Listening...' :
                                        callStatus === 'processing' ? 'Thinking...' :
                                            'Speaking...'}
                            </h3>
                            <p className="text-muted-foreground">
                                {callStatus === 'idle' ? 'Tap the mic to start speaking' :
                                    callStatus === 'listening' ? 'Tap to send' :
                                        'Mitesh Khatri'}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {callStatus === 'idle' ? (
                                <Button size="lg" className="rounded-full w-16 h-16" onClick={startCall}>
                                    <Mic className="w-6 h-6" />
                                </Button>
                            ) : callStatus === 'listening' ? (
                                <Button size="lg" variant="destructive" className="rounded-full w-16 h-16 animate-pulse" onClick={stopListening}>
                                    <Send className="w-6 h-6" />
                                </Button>
                            ) : (
                                <Button size="lg" variant="outline" className="rounded-full w-16 h-16" disabled>
                                    <MoreHorizontal className="w-6 h-6" />
                                </Button>
                            )}

                            <Button variant="ghost" size="lg" className="rounded-full w-16 h-16 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={endCall}>
                                <Phone className="w-6 h-6 rotate-135" />
                            </Button>
                        </div>

                        <audio ref={audioPlayerRef} className="hidden" />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChatPage;
