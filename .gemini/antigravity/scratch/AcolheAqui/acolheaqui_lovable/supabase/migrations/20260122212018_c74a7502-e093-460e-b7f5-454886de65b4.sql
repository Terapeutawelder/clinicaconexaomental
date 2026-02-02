-- Create modules table for members area
CREATE TABLE public.member_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.member_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.member_modules(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member progress table
CREATE TABLE public.member_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.member_lessons(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create members table (who has access)
CREATE TABLE public.member_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_access ENABLE ROW LEVEL SECURITY;

-- RLS for member_modules
CREATE POLICY "Professionals can manage their modules"
  ON public.member_modules FOR ALL
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Published modules are viewable by members"
  ON public.member_modules FOR SELECT
  USING (is_published = true);

-- RLS for member_lessons
CREATE POLICY "Professionals can manage their lessons"
  ON public.member_lessons FOR ALL
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Members can view lessons"
  ON public.member_lessons FOR SELECT
  USING (
    module_id IN (SELECT id FROM member_modules WHERE is_published = true)
  );

-- RLS for member_progress
CREATE POLICY "Users can manage their own progress"
  ON public.member_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can view member progress"
  ON public.member_progress FOR SELECT
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS for member_access
CREATE POLICY "Professionals can manage member access"
  ON public.member_access FOR ALL
  USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own access"
  ON public.member_access FOR SELECT
  USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_member_modules_updated_at
  BEFORE UPDATE ON public.member_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_lessons_updated_at
  BEFORE UPDATE ON public.member_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_progress_updated_at
  BEFORE UPDATE ON public.member_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for member videos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('member-videos', 'member-videos', false, 524288000)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for member videos
CREATE POLICY "Professionals can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'member-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Professionals can update their videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'member-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Professionals can delete their videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'member-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'member-videos' AND auth.uid() IS NOT NULL);