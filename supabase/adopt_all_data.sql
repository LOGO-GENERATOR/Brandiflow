-- ==========================================
-- ADOPT ALL DATA (RE-ASSIGN TO ME)
-- ==========================================

DO $$
DECLARE
  target_user_id uuid;
  target_email text := 'sabdeo468@gmail.com'; -- YOUR EMAIL
BEGIN
  -- 1. Get your current ID
  SELECT id INTO target_user_id
  FROM next_auth.users
  WHERE email = target_email;

  IF target_user_id IS NOT NULL THEN
    RAISE NOTICE 'Target User ID: %', target_user_id;

    -- 2. Update ALL Projects to belong to you
    -- (Warning: This takes everything in the DB. Use with caution if multiple users exist!)
    UPDATE public.projects
    SET user_id = target_user_id
    WHERE user_id != target_user_id;
    
    RAISE NOTICE 'Projects updated.';

    -- 3. Update Usage Tracking if needed (or reset it)
    -- This ensures your stats counter starts counting these adopted logos if logic allows
    -- (Actually usage is usually just a counter, but let's ensure the record exists)
    INSERT INTO public.usage_tracking (user_id, logos_generated_count_month)
    VALUES (target_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Data adoption complete for %', target_email;
  ELSE
    RAISE NOTICE 'User % not found!', target_email;
  END IF;
END $$;
