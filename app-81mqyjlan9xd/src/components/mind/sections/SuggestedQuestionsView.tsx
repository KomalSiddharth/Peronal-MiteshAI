import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, GripVertical, Pencil, Trash2, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
    id: string;
    text: string;
}

const SuggestedQuestionsView = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([
        { id: '1', text: "What advice would you give to someone who feels their affirmations are not working?" },
        { id: '2', text: "What is the key to maintaining motivation during slow progress?" },
        { id: '3', text: "How do you suggest people deal with negative opinions they hold about themselves?" },
        { id: '4', text: "What is a powerful question you often ask your clients to inspire reflection?" },
        { id: '5', text: "What is a common pattern you observe in individuals who seek your guidance?" },
    ]);

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold">Suggested Questions</h2>
                <p className="text-muted-foreground">Set questions to display on the Clone's profile</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Generated Questions Column */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Generated Questions</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search your questions"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 rounded-full bg-muted/30"
                        />
                    </div>
                    <div className="space-y-3">
                        {generatedQuestions.map((q) => (
                            <div key={q.id} className="flex items-center gap-3 p-4 border rounded-lg bg-background group hover:border-orange-200 transition-colors">
                                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                <p className="flex-1 text-sm font-medium">{q.text}</p>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visible to Users Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/50" />
                            <h3 className="text-lg font-medium">Visible to users</h3>
                        </div>
                        <Button className="bg-black text-white hover:bg-black/90 rounded-full text-xs h-8 gap-1">
                            Add Question <Plus className="w-3 h-3" />
                        </Button>
                    </div>

                    <div className="border-2 border-dashed rounded-xl h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-4 bg-muted/10">
                        <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center rotate-3">
                            <Sparkles className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-medium">No visible questions</h4>
                            <p className="text-sm text-muted-foreground max-w-[200px]">
                                Drag questions here to make them visible to users.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuggestedQuestionsView;
