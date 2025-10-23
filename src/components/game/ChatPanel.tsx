import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Message {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

interface ChatPanelProps {
  roomId: string;
}

const ChatPanel = ({ roomId }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: participant } = await supabase
        .from("room_participants")
        .select("username")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase.from("chat_messages").insert({
        room_id: roomId,
        user_id: user.id,
        username: participant?.username || "Unknown",
        content: newMessage,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Card className="p-4 bg-gradient-card shadow-noir border-border h-[500px] flex flex-col">
      <h2 className="text-xl font-bold text-primary mb-4">Discussion</h2>
      
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-secondary p-3 rounded-lg">
            <p className="text-primary text-sm font-medium">{message.username}</p>
            <p className="text-foreground text-sm mt-1">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Share your theories..."
          className="bg-input border-border"
        />
        <Button
          type="submit"
          size="icon"
          className="bg-primary hover:bg-primary/90 transition-smooth"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};

export default ChatPanel;
