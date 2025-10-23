import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Lock, FileText, Video, AlertCircle, Image } from "lucide-react";

interface Clue {
  id: number;
  title: string;
  description: string;
  type: string;
}

interface ClueBoardProps {
  clues: Clue[];
  discoveredClues: number[];
  onDiscoverClue: (clueIndex: number) => void;
}

const ClueBoard = ({ clues, discoveredClues, onDiscoverClue }: ClueBoardProps) => {
  const getClueIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "physical":
        return <AlertCircle className="w-5 h-5" />;
      case "evidence":
        return <Image className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-noir border-border">
      <h2 className="text-2xl font-bold text-primary mb-4">Evidence Board</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clues.map((clue, index) => {
          const isDiscovered = discoveredClues.includes(index);
          return (
            <Card
              key={clue.id}
              className={`p-4 border-border transition-smooth ${
                isDiscovered
                  ? "bg-secondary"
                  : "bg-muted/30 hover:bg-muted/50 cursor-pointer"
              }`}
              onClick={() => !isDiscovered && onDiscoverClue(index)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDiscovered
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDiscovered ? getClueIcon(clue.type) : <Lock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">
                    {isDiscovered ? clue.title : "???"}
                  </h3>
                  {isDiscovered ? (
                    <p className="text-sm text-muted-foreground">{clue.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Click to investigate
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

export default ClueBoard;
