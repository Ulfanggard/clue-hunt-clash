import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GameScene3D from "@/components/game/GameScene3D";
import ChatPanel from "@/components/game/ChatPanel";
import ParticipantsList from "@/components/game/ParticipantsList";
import SolutionPanel from "@/components/game/SolutionPanel";
import ClueDialog from "@/components/game/ClueDialog";

interface GameCase {
  id: string;
  title: string;
  description: string;
  victim: string;
  solution: string;
  clues: any[];
}

const Game = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<any>(null);
  const [gameCase, setGameCase] = useState<GameCase | null>(null);
  const [discoveredClues, setDiscoveredClues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClue, setSelectedClue] = useState<any>(null);
  const [isClueDialogOpen, setIsClueDialogOpen] = useState(false);

  useEffect(() => {
    loadGameData();
    subscribeToClues();
  }, [roomCode]);

  const loadGameData = async () => {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*, cases(*)")
        .eq("code", roomCode)
        .single();

      if (roomError) throw roomError;
      if (roomData.status !== "playing") {
        navigate(`/lobby/${roomCode}`);
        return;
      }

      setRoom(roomData);
      setGameCase(roomData.cases as GameCase);

      const { data: cluesData, error: cluesError } = await supabase
        .from("discovered_clues")
        .select("clue_index")
        .eq("room_id", roomData.id);

      if (cluesError) throw cluesError;
      setDiscoveredClues(cluesData.map((c: any) => c.clue_index));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToClues = () => {
    const channel = supabase
      .channel("discovered-clues")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discovered_clues",
        },
        () => {
          loadGameData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const discoverClue = async (clueIndex: number) => {
    if (!room || discoveredClues.includes(clueIndex)) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("discovered_clues").insert({
        room_id: room.id,
        clue_index: clueIndex,
        discovered_by: user.id,
      });

      if (error) throw error;

      // Show the clue in a dialog
      setSelectedClue(gameCase?.clues[clueIndex]);
      setIsClueDialogOpen(true);

      toast({
        title: "Clue Discovered!",
        description: `You found: ${gameCase?.clues[clueIndex].title}`,
      });
    } catch (error: any) {
      console.error("Error discovering clue:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-spotlight flex items-center justify-center">
        <p className="text-primary text-xl">Loading investigation...</p>
      </div>
    );
  }

  if (!gameCase) return null;

  return (
    <div className="min-h-screen bg-gradient-spotlight">
      <div className="container mx-auto p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2 text-shadow-noir">
            {gameCase.title}
          </h1>
          <p className="text-foreground text-lg">{gameCase.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GameScene3D
              clues={gameCase.clues}
              discoveredClues={discoveredClues}
              onDiscoverClue={discoverClue}
            />
            <SolutionPanel roomId={room?.id} solution={gameCase.solution} />
          </div>

          <div className="space-y-6">
            <ParticipantsList roomId={room?.id} />
            <ChatPanel roomId={room?.id} />
          </div>
        </div>
      </div>

      <ClueDialog
        clue={selectedClue}
        isOpen={isClueDialogOpen}
        onClose={() => setIsClueDialogOpen(false)}
      />
    </div>
  );
};

export default Game;
