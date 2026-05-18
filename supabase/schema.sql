-- SkillMateAI Supabase Schema
-- Run this in the Supabase SQL Editor

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  name        text NOT NULL,
  role        text NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at  timestamptz DEFAULT now()
);

-- Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  topic               text NOT NULL,
  status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'analysed')),
  understanding_score integer CHECK (understanding_score BETWEEN 0 AND 10),
  weak_topics         text[],
  transcript          text,
  created_at          timestamptz DEFAULT now(),
  ended_at            timestamptz
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('teacher', 'student')),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Self-study items
CREATE TABLE IF NOT EXISTS public.self_study_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_text text NOT NULL,
  topic       text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Questions (from sessions or self-study)
CREATE TABLE IF NOT EXISTS public.questions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  self_study_item_id  uuid REFERENCES public.self_study_items(id) ON DELETE CASCADE,
  student_id          uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content             text NOT NULL,
  options             jsonb NOT NULL,
  correct_answer      text NOT NULL,
  explanation         text NOT NULL,
  topic               text NOT NULL,
  difficulty          text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source              text NOT NULL CHECK (source IN ('session', 'self_study')),
  created_at          timestamptz DEFAULT now()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id          uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  self_study_item_id  uuid REFERENCES public.self_study_items(id) ON DELETE SET NULL,
  topic               text NOT NULL,
  questions           jsonb NOT NULL,
  answers             jsonb NOT NULL,
  score               integer NOT NULL,
  total               integer NOT NULL,
  created_at          timestamptz DEFAULT now()
);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for live chat and question notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;

-- RLS Policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_study_items ENABLE ROW LEVEL SECURITY;

-- Profiles: readable by all authenticated users (for search), writable by owner
CREATE POLICY "Profiles readable by authenticated users"
  ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions: teacher sees own, student sees theirs
CREATE POLICY "Sessions visible to participants"
  ON public.sessions FOR SELECT
  USING (teacher_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Teachers create sessions"
  ON public.sessions FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers update own sessions"
  ON public.sessions FOR UPDATE USING (teacher_id = auth.uid());

-- Messages: visible to session participants
CREATE POLICY "Messages visible to session participants"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id
        AND (s.teacher_id = auth.uid() OR s.student_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id
        AND s.status = 'active'
        AND (s.teacher_id = auth.uid() OR s.student_id = auth.uid())
    )
  );

-- Questions: teacher sees all for their sessions; students see approved
CREATE POLICY "Teachers see questions for their sessions"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.teacher_id = auth.uid()
    )
    OR student_id = auth.uid()
  );

-- Quiz attempts: students see own
CREATE POLICY "Students see own attempts"
  ON public.quiz_attempts FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students insert own attempts"
  ON public.quiz_attempts FOR INSERT WITH CHECK (student_id = auth.uid());

-- Self-study items: private to student
CREATE POLICY "Students see own self-study items"
  ON public.self_study_items FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students insert own self-study items"
  ON public.self_study_items FOR INSERT WITH CHECK (student_id = auth.uid());
