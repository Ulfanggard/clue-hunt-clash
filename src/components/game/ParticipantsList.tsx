import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface Participant {
  id: string;
  username: string;
}

interface ParticipantsListProps {
  roomId: string;
}

const ParticipantsList = ({ roomId }: ParticipantsListProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    loadParticipants();
    subscribeToParticipants();
  }, [roomId]);

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from("room_participants")
      .select("id, username")
      .eq("room_id", roomId);

    if (!error && data) {
      setParticipants(data);
    }
  };

  const subscribeToParticipants = () => {
    const channel = supabase
      .channel("participants-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_participants",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <Card className="p-4 bg-gradient-card shadow-noir border-border">
      <h2 className="text-xl font-bold text-primary mb-4">
        Detectives ({participants.length})
      </h2>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-2 bg-secondary rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground text-sm font-medium">
              {participant.username}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ParticipantsList;
