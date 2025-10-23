import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

interface SolutionPanelProps {
  roomId: string;
  solution: string;
}

const SolutionPanel = ({ roomId, solution }: SolutionPanelProps) => {
  const [guess, setGuess] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkSolution = () => {
    const normalized = guess.toLowerCase().trim();
    const correctSolution = solution.toLowerCase().trim();
    const isMatch = normalized.includes("curator") && normalized.includes("safe");

    setIsCorrect(isMatch);
    setHasSubmitted(true);

    if (isMatch) {
      toast({
        title: "Case Solved!",
        description: "Excellent detective work! You've cracked the case.",
      });
    } else {
      toast({
        title: "Not quite...",
        description: "Keep investigating. Review the clues for more insights.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-noir border-border">
      <h2 className="text-2xl font-bold text-primary mb-4">Solve the Case</h2>
      <p className="text-foreground mb-4">
        Once you've gathered enough evidence, submit your solution:
      </p>

      <Textarea
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Who committed the crime? How did they do it? Where is the evidence?"
        className="mb-4 min-h-[120px] bg-input border-border"
        disabled={hasSubmitted && isCorrect === true}
      />

      {hasSubmitted && (
        <div
          className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
            isCorrect
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <div>
            <p className="font-bold">
              {isCorrect ? "Case Solved!" : "Incorrect Solution"}
            </p>
            {isCorrect && (
              <p className="text-sm opacity-90 mt-1">
                {solution}
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={checkSolution}
        disabled={!guess.trim() || (hasSubmitted && isCorrect === true)}
        className="w-full bg-gradient-gold hover:shadow-gold-glow transition-smooth"
      >
        {hasSubmitted && isCorrect === true ? "Case Closed" : "Submit Solution"}
      </Button>
    </Card>
  );
};

export default SolutionPanel;
