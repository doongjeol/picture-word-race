
CREATE TABLE public.game_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  faith_pos INTEGER NOT NULL DEFAULT 0,
  soccer_pos INTEGER NOT NULL DEFAULT 0,
  current_turn TEXT NOT NULL DEFAULT 'faith' CHECK (current_turn IN ('faith','soccer')),
  last_dice INTEGER,
  rolling BOOLEAN NOT NULL DEFAULT false,
  modal JSONB NOT NULL DEFAULT '{"kind":"idle"}'::jsonb,
  winner TEXT,
  reveal_dice_at BIGINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT game_state_single_row CHECK (id = 1)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_state TO anon, authenticated;
GRANT ALL ON public.game_state TO service_role;

ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game state"
  ON public.game_state FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update game state"
  ON public.game_state FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can insert game state"
  ON public.game_state FOR INSERT
  WITH CHECK (true);

-- seed single row
INSERT INTO public.game_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
ALTER TABLE public.game_state REPLICA IDENTITY FULL;
