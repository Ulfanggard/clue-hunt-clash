import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClueDialogProps {
  clue: any;
  isOpen: boolean;
  onClose: () => void;
}

const ClueDialog = ({ clue, isOpen, onClose }: ClueDialogProps) => {
  if (!clue) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            {clue.title}
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            {clue.description}
          </DialogDescription>
        </DialogHeader>
        {clue.imageUrl && (
          <img
            src={clue.imageUrl}
            alt={clue.title}
            className="w-full rounded-lg mt-4"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClueDialog;
