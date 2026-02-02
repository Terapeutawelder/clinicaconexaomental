-- Create community posts table for member area discussions
CREATE TABLE public.member_community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community post likes table
CREATE TABLE public.member_community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.member_community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create member events table
CREATE TABLE public.member_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  event_type TEXT DEFAULT 'live', -- 'live', 'webinar', 'workshop'
  meeting_url TEXT,
  max_participants INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.member_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.member_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.member_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for community posts
CREATE POLICY "Members can view posts from professionals they have access to"
ON public.member_community_posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.member_access
    WHERE member_access.professional_id = member_community_posts.professional_id
    AND member_access.user_id = auth.uid()
    AND member_access.is_active = true
  )
  OR professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Members can create posts in communities they have access to"
ON public.member_community_posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (
    EXISTS (
      SELECT 1 FROM public.member_access
      WHERE member_access.professional_id = member_community_posts.professional_id
      AND member_access.user_id = auth.uid()
      AND member_access.is_active = true
    )
    OR professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own posts"
ON public.member_community_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.member_community_posts FOR DELETE
USING (auth.uid() = user_id);

-- Policies for likes
CREATE POLICY "Members can view likes"
ON public.member_community_likes FOR SELECT
USING (true);

CREATE POLICY "Members can like posts"
ON public.member_community_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.member_community_likes FOR DELETE
USING (auth.uid() = user_id);

-- Policies for events
CREATE POLICY "Members can view published events from their professionals"
ON public.member_events FOR SELECT
USING (
  is_published = true AND (
    EXISTS (
      SELECT 1 FROM public.member_access
      WHERE member_access.professional_id = member_events.professional_id
      AND member_access.user_id = auth.uid()
      AND member_access.is_active = true
    )
    OR professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Professionals can manage their own events"
ON public.member_events FOR ALL
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Policies for event registrations
CREATE POLICY "Members can view their registrations"
ON public.member_event_registrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Members can register for events"
ON public.member_event_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can cancel their registrations"
ON public.member_event_registrations FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_member_community_posts_updated_at
BEFORE UPDATE ON public.member_community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_events_updated_at
BEFORE UPDATE ON public.member_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();