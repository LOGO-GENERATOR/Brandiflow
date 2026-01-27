-- ==========================================
-- FIX MISSING PROFILE & RESTORE SUPER ADMIN
-- ==========================================

DO $$
DECLARE
  var_user_id uuid;
BEGIN
  -- 1. Find the user ID from next_auth using the email
  -- (Adjust the email if it's different, e.g. case sensitivity)
  SELECT id INTO var_user_id 
  FROM next_auth.users 
  WHERE email = 'sabdeo468@gmail.com';

  -- 2. If user exists in Auth but not in Profiles, Insert it.
  -- If it exists, Update it to ensure super_admin role.
  IF var_user_id IS NOT NULL THEN
    RAISE NOTICE 'Found User ID: %', var_user_id;

    INSERT INTO public.profiles (id, email, full_name, billing_plan, role)
    VALUES (
      var_user_id, 
      'sabdeo468@gmail.com', 
      'Super Admin', 
      'BUSINESS',   
      'super_admin' -- RESTORE SUPER ADMIN STATUS
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'super_admin',
      billing_plan = 'BUSINESS',
      email = EXCLUDED.email; -- Refresh email just in case
      
     RAISE NOTICE 'Profile fixed/updated for sabdeo468@gmail.com';
  ELSE
     RAISE NOTICE 'User sabdeo468@gmail.com not found in next_auth.users. Have you logged in?';
  END IF;
END $$;
