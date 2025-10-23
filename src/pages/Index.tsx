import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      setUser(user);
      setUsername(user.user_metadata?.username || "Detective");
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    if (!roomName.trim() || !username.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both room name and your detective name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const code = generateRoomCode();

      // Get first case
      const { data: cases } = await supabase
        .from("cases")
        .select("id")
        .limit(1)
        .single();

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({
          name: roomName,
          code,
          host_id: user.id,
          case_id: cases?.id,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { error: participantError } = await supabase
        .from("room_participants")
        .insert({
          room_id: room.id,
          user_id: user.id,
          username,
        });

      if (participantError) throw participantError;

      toast({
        title: "Room created!",
        description: `Room code: ${code}`,
      });
      navigate(`/lobby/${code}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim() || !username.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both room code and your detective name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", joinCode.toUpperCase())
        .single();

      if (roomError) {
        toast({
          title: "Room not found",
          description: "Please check the room code and try again",
          variant: "destructive",
        });
        return;
      }

      const { error: participantError } = await supabase
        .from("room_participants")
        .insert({
          room_id: room.id,
          user_id: user.id,
          username,
        });

      if (participantError) {
        if (participantError.code === "23505") {
          toast({
            title: "Already in room",
            description: "You're already a participant in this room",
          });
          navigate(`/lobby/${joinCode.toUpperCase()}`);
          return;
        }
        throw participantError;
      }

      navigate(`/lobby/${joinCode.toUpperCase()}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-spotlight">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-primary text-shadow-noir">
            Detective Noir
          </h1>
          <Button
            onClick={handleSignOut}
            variant="secondary"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="p-8 bg-gradient-card shadow-noir border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Create Room</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username-create">Your Detective Name</Label>
                <Input
                  id="username-create"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-input border-border"
                />
              </div>

              <div>
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="The Midnight Investigation"
                  className="bg-input border-border"
                />
              </div>

              <Button
                onClick={createRoom}
                disabled={loading}
                className="w-full bg-gradient-gold hover:shadow-gold-glow transition-smooth"
              >
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-card shadow-noir border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Join Room</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username-join">Your Detective Name</Label>
                <Input
                  id="username-join"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-input border-border"
                />
              </div>

              <div>
                <Label htmlFor="joinCode">Room Code</Label>
                <Input
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABCD12"
                  className="bg-input border-border uppercase"
                  maxLength={6}
                />
              </div>

              <Button
                onClick={joinRoom}
                disabled={loading}
                className="w-full bg-gradient-gold hover:shadow-gold-glow transition-smooth"
              >
                {loading ? "Joining..." : "Join Room"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <Card className="p-8 bg-gradient-card shadow-noir border-border">
            <h2 className="text-2xl font-bold text-primary mb-4">
              How to Play
            </h2>
            <div className="space-y-3 text-foreground">
              <p>• <strong className="text-primary">Create or Join</strong> a room with your fellow detectives</p>
              <p>• <strong className="text-primary">Investigate</strong> the crime scene by clicking on clues</p>
              <p>• <strong className="text-primary">Discuss</strong> your findings with other players in the chat</p>
              <p>• <strong className="text-primary">Solve</strong> the mystery by piecing together the evidence</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
