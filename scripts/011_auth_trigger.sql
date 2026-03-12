-- 011_auth_trigger.sql
-- Auto-create profile on signup with role detection

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  user_role TEXT := 'user';
  user_tenant_id UUID;
  user_full_name TEXT;
BEGIN
  -- Extract full_name from metadata if provided
  user_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NULL
  );

  -- SUPER ADMIN: Auto-elevate the platform owner
  IF NEW.email = 'michaelvincenthopkins@gmail.com' THEN
    user_role := 'super_admin';
    user_tenant_id := NULL; -- Super admin has no tenant
  ELSE
    -- Check for pending invitation
    SELECT * INTO invite_record 
    FROM tenant_invitations 
    WHERE email = NEW.email 
      AND accepted_at IS NULL 
      AND expires_at > now()
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF invite_record IS NOT NULL THEN
      -- User was invited - assign to tenant with invited role
      user_role := invite_record.role;
      user_tenant_id := invite_record.tenant_id;
      
      -- Mark invitation as accepted
      UPDATE tenant_invitations 
      SET accepted_at = now() 
      WHERE id = invite_record.id;
    ELSE
      -- Self-signup: check if tenant_id was passed in metadata
      user_tenant_id := (NEW.raw_user_meta_data ->> 'tenant_id')::UUID;
      
      -- If tenant_id provided in metadata, use it
      -- Otherwise user will need to be assigned to a tenant later
    END IF;
  END IF;

  -- Create the profile
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    role, 
    tenant_id,
    onboarding_completed,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_role,
    user_tenant_id,
    false,
    'active',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also handle email updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    email = NEW.email,
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();
