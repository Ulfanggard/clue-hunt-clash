-- Drop the problematic policy
DROP POLICY IF EXISTS "Participants are viewable by room members" ON public.room_participants;

-- Create a security definer function to check if user is in a room
CREATE OR REPLACE FUNCTION public.is_room_participant(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_participants
    WHERE user_id = _user_id
      AND room_id = _room_id
  )
$$;

-- Create new policy using the function
CREATE POLICY "Participants are viewable by room members"
ON public.room_participants
FOR SELECT
USING (public.is_room_participant(auth.uid(), room_id));