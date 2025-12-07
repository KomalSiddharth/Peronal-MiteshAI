import { Settings, Trash2, Youtube, FileText, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ContentItem } from '@/types/types';

interface ContentListProps {
  items: ContentItem[];
  onDelete: (id: string) => void;
}

const ContentList = ({ items, onDelete }: ContentListProps) => {
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-destructive" />;
      case 'feed':
        return <Rss className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">CONTENT</TableHead>
            <TableHead className="text-right">UPLOADED</TableHead>
            <TableHead className="text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                No content found. Upload your first content to get started.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getSourceIcon(item.source_type)}</div>
                    <div className="space-y-1">
                      <p className="font-medium leading-tight">{item.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.source_type}</span>
                        <span>•</span>
                        <span>{item.word_count.toLocaleString()} words</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-y-1">
                    <p className="text-sm">{formatDate(item.uploaded_at)}</p>
                    {item.metadata?.source && (
                      <Badge variant="secondary" className="text-xs">
                        From {item.metadata.source}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentList;
