-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cases table (stores mystery cases)
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  victim TEXT NOT NULL,
  solution TEXT NOT NULL,
  clues JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting',
  max_players INTEGER DEFAULT 6,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_participants table
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create discovered_clues table
CREATE TABLE public.discovered_clues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  clue_index INTEGER NOT NULL,
  discovered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, clue_index)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases (everyone can read)
CREATE POLICY "Cases are viewable by everyone" ON public.cases
  FOR SELECT USING (true);

-- RLS Policies for rooms
CREATE POLICY "Rooms are viewable by participants" ON public.rooms
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.room_participants WHERE room_id = rooms.id
    ) OR auth.uid() = host_id
  );

CREATE POLICY "Users can create rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update rooms" ON public.rooms
  FOR UPDATE USING (auth.uid() = host_id);

-- RLS Policies for room_participants
CREATE POLICY "Participants are viewable by room members" ON public.room_participants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.room_participants WHERE room_id = room_participants.room_id
    )
  );

CREATE POLICY "Users can join rooms" ON public.room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON public.room_participants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for discovered_clues
CREATE POLICY "Clues viewable by room participants" ON public.discovered_clues
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.room_participants WHERE room_id = discovered_clues.room_id
    )
  );

CREATE POLICY "Participants can discover clues" ON public.discovered_clues
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.room_participants WHERE room_id = discovered_clues.room_id
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Messages viewable by room participants" ON public.chat_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.room_participants WHERE room_id = chat_messages.room_id
    )
  );

CREATE POLICY "Participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.room_participants WHERE room_id = chat_messages.room_id
    ) AND auth.uid() = user_id
  );

-- Enable realtime for multiplayer features
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discovered_clues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- Insert a sample case
INSERT INTO public.cases (title, description, victim, solution, clues) VALUES (
  'The Midnight Museum Heist',
  'A priceless diamond was stolen from the city museum at midnight. The alarm was disabled, and there are no signs of forced entry. Three suspects were in the building: the night guard, the curator, and a janitor.',
  'Museum Security System',
  'The curator disabled the alarm using their master code. The diamond is hidden in their office safe.',
  '[
    {"id": 1, "title": "Security Logs", "description": "The alarm was disabled at 11:47 PM using the curator''s access code.", "type": "document"},
    {"id": 2, "title": "Fingerprints", "description": "Fresh fingerprints on the display case match the curator''s records.", "type": "evidence"},
    {"id": 3, "title": "Guard Statement", "description": "The night guard saw the curator working late, which was unusual for a Friday night.", "type": "testimony"},
    {"id": 4, "title": "Office Safe", "description": "The curator''s office safe shows signs of recent use. A faint diamond sparkle visible through the crack.", "type": "physical"},
    {"id": 5, "title": "Bank Records", "description": "The curator has significant gambling debts that need immediate payment.", "type": "document"},
    {"id": 6, "title": "CCTV Footage", "description": "Camera shows the curator entering the exhibit hall at 11:45 PM and leaving at 12:03 AM with a bulge in their coat.", "type": "video"}
  ]'::jsonb
);