import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface Participant {
  id: string;
  username: string;
  joined_at: string;
}

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoom();
    subscribeToParticipants();
    subscribeToRoomStatus();
  }, [roomCode]);

  const loadRoom = async () => {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", roomCode)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsHost(user?.id === roomData.host_id);

      const { data: participantsData, error: participantsError } =
        await supabase
          .from("room_participants")
          .select("*")
          .eq("room_id", roomData.id)
          .order("joined_at", { ascending: true });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);
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

  const subscribeToParticipants = () => {
    const channel = supabase
      .channel("room-participants")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_participants",
        },
        () => {
          loadRoom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToRoomStatus = () => {
    const channel = supabase
      .channel("room-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
        },
        (payload: any) => {
          if (payload.new.status === "playing") {
            navigate(`/game/${roomCode}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startGame = async () => {
    if (!isHost || !room) return;

    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status: "playing" })
        .eq("id", room.id);

      if (error) throw error;
      navigate(`/game/${roomCode}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const leaveRoom = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !room) return;

      const { error } = await supabase
        .from("room_participants")
        .delete()
        .eq("room_id", room.id)
        .eq("user_id", user.id);

      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-spotlight flex items-center justify-center">
        <p className="text-primary text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-spotlight p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 bg-gradient-card shadow-noir border-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2 text-shadow-noir">
              {room?.name}
            </h1>
            <p className="text-2xl text-muted-foreground">
              Room Code: <span className="text-primary font-bold">{roomCode}</span>
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Detectives in the Room ({participants.length}/{room?.max_players})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <Card
                  key={participant.id}
                  className="p-4 bg-secondary border-border flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">
                    {participant.username}
                  </span>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            {isHost && (
              <Button
                onClick={startGame}
                disabled={participants.length < 1}
                className="bg-gradient-gold hover:shadow-gold-glow transition-smooth px-8 py-6 text-lg"
              >
                Start Investigation
              </Button>
            )}
            <Button
              onClick={leaveRoom}
              variant="secondary"
              className="px-8 py-6 text-lg"
            >
              Leave Room
            </Button>
          </div>

          {isHost && participants.length < 1 && (
            <p className="text-center text-muted-foreground mt-4">
              Waiting for detectives to join...
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Lobby;
