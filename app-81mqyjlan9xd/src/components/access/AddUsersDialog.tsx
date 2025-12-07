import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, FileText, X } from "lucide-react";
import InviteByEmailDialog from "./InviteByEmailDialog";
import ImportFromCSVDialog from "./ImportFromCSVDialog";

interface AddUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUsersDialog({ open, onOpenChange }: AddUsersDialogProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCSVDialog, setShowCSVDialog] = useState(false);

  const handleEmailClick = () => {
    setShowEmailDialog(true);
    onOpenChange(false);
  };

  const handleCSVClick = () => {
    setShowCSVDialog(true);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Add Users</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Invite by email</h3>
                  <p className="text-sm text-muted-foreground">
                    Invite members to your audience by email.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailClick}
                className="ml-4"
              >
                Add +
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Import from CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your audience in bulk from a CSV file.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCSVClick}
                className="ml-4"
              >
                Add +
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InviteByEmailDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
      />

      <ImportFromCSVDialog
        open={showCSVDialog}
        onOpenChange={setShowCSVDialog}
      />
    </>
  );
}
