import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addAudienceMember } from "@/db/api";

interface ImportFromCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportFromCSVDialog({ open, onOpenChange }: ImportFromCSVDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      parseCSVPreview(file);
    }
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim() !== "");
      // Subtract 1 for header row
      setUserCount(Math.max(0, lines.length - 1));
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): Array<{ email: string; tags: string[]; name: string }> => {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    const emailIndex = headers.indexOf("email");
    const tagsIndex = headers.indexOf("tags");
    const nameIndex = headers.indexOf("name");

    if (emailIndex === -1) {
      throw new Error("CSV must contain an 'email' column");
    }

    const users: Array<{ email: string; tags: string[]; name: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const email = values[emailIndex];
      
      if (!email) continue;

      const tags = tagsIndex !== -1 && values[tagsIndex]
        ? values[tagsIndex].split(";").map(t => t.trim()).filter(t => t !== "")
        : [];
      
      const name = nameIndex !== -1 && values[nameIndex]
        ? values[nameIndex]
        : email.split("@")[0];

      users.push({ email, tags, name });
    }

    return users;
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const text = await selectedFile.text();
      const users = parseCSV(text);

      if (users.length === 0) {
        toast({
          title: "No users found",
          description: "The CSV file does not contain any valid user data.",
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      // Add users to database
      const promises = users.map(user =>
        addAudienceMember({
          name: user.name,
          email: user.email,
          tags: user.tags,
          message_count: 0,
          last_active: new Date().toISOString(),
        })
      );

      await Promise.all(promises);

      toast({
        title: "Success",
        description: `${users.length} user(s) imported successfully.`,
      });

      setSelectedFile(null);
      setUserCount(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import users. Please check your CSV format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUserCount(0);
    onOpenChange(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </button>
            <DialogTitle className="text-xl font-semibold">
              Import from CSV
            </DialogTitle>
          </div>
          <button
            onClick={handleCancel}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Upload a CSV with two columns. The first row should be the header for
              the CSV and contain the name of each column: "email", "tags", and
              "name".
            </p>
            <p>
              The tags column can be left blank if you do not want to assign tags to
              the user. Otherwise, the tags should be a comma-separated list of tags
              (e.g "tag1, tag2"). The name column can be left blank if you do not want
              to assign a name to the user.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            variant="outline"
            onClick={handleUploadClick}
            className="w-full h-auto py-6 border-2 border-dashed hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5" />
              <span className="font-medium">
                {selectedFile ? selectedFile.name : "Upload CSV..."}
              </span>
            </div>
          </Button>

          {selectedFile && (
            <p className="text-sm text-muted-foreground text-center">
              Ready to import {userCount} user(s)
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || !selectedFile}
            className="bg-muted-foreground hover:bg-muted-foreground/90 text-white"
          >
            {isImporting ? "Importing..." : `Import ${userCount} user(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
