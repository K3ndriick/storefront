-- =============================================================================
-- Seed: Mock appointments for April 2026
-- =============================================================================
-- Usage (Supabase SQL Editor or psql):
--   Paste and run this entire file.
--
-- What this does:
--   1. Inserts 5 mock services (ON CONFLICT DO NOTHING - safe to re-run).
--   2. Deletes any existing appointments in April 2026 (clean slate).
--   3. Inserts 21 appointments spread across April weekdays.
--
-- IMPORTANT: Replace the two placeholder UUIDs before running:
--   :user_id  →  a real UUID from auth.users (run the helper query below)
--
-- Helper - find a user ID to use:
--   SELECT id, email FROM auth.users LIMIT 5;
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Set the user_id to use for all seed appointments
--    Replace this value with a real UUID from your auth.users table.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  v_user_id UUID;
BEGIN

  -- Auto-pick the first user in the project. Change this if you want a specific one.
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in auth.users. Create an account first, then re-run this script.';
  END IF;

  RAISE NOTICE 'Using user_id: %', v_user_id;

-- ---------------------------------------------------------------------------
-- 1. Upsert mock services (fixed UUIDs for idempotency)
-- ---------------------------------------------------------------------------

INSERT INTO services (id, name, description, duration_minutes, price, active)
VALUES
  ('aaaaaaaa-0001-0000-0000-000000000000', 'Treadmill Service & Repair',
   'Full inspection, lubrication, belt tension adjustment, and electrical diagnostic.',
   90, 150.00, true),

  ('aaaaaaaa-0002-0000-0000-000000000000', 'Bike Tune-Up',
   'Drivetrain clean, cable adjustment, brake bleed, and full safety check.',
   60, 80.00, true),

  ('aaaaaaaa-0003-0000-0000-000000000000', 'Equipment Installation',
   'Professional delivery and installation of gym equipment at your home or facility.',
   120, 200.00, true),

  ('aaaaaaaa-0004-0000-0000-000000000000', 'General Inspection',
   'Comprehensive safety and function check across all equipment.',
   45, 60.00, true),

  ('aaaaaaaa-0005-0000-0000-000000000000', 'Elliptical Repair',
   'Diagnose and repair faults, replace worn components, calibrate resistance levels.',
   75, 120.00, true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Clear any existing April 2026 appointments (idempotent re-runs)
-- ---------------------------------------------------------------------------

DELETE FROM appointments
WHERE appointment_date BETWEEN '2026-04-01' AND '2026-04-30';

-- ---------------------------------------------------------------------------
-- 3. Insert appointments
--
-- Status distribution:
--   completed / cancelled  →  early April  (past)
--   confirmed              →  mid April    (imminent)
--   pending                →  late April   (upcoming)
--
-- Times are non-overlapping per day within the 09:00–17:00 window.
-- end_time = appointment_time + duration_minutes.
-- ---------------------------------------------------------------------------

INSERT INTO appointments (
  user_id, service_id,
  appointment_date, appointment_time, end_time, duration_minutes,
  status,
  customer_name, customer_email, customer_phone,
  equipment_type, equipment_brand, issue_description,
  admin_notes,
  confirmed_at, completed_at
)
VALUES

-- ── April 1 (Wednesday) ────────────────────────────────────────────────────

  -- 09:00–10:30  Treadmill (90 min)
  (v_user_id, 'aaaaaaaa-0001-0000-0000-000000000000',
   '2026-04-01', '09:00:00', '10:30:00', 90,
   'completed',
   'Marcus Webb', 'marcus.webb@gmail.com', '0412 345 678',
   'Treadmill', 'NordicTrack', 'Belt slipping and motor making a grinding noise.',
   NULL, NOW(), NOW()),

  -- 11:00–12:00  Bike (60 min)
  (v_user_id, 'aaaaaaaa-0002-0000-0000-000000000000',
   '2026-04-01', '11:00:00', '12:00:00', 60,
   'completed',
   'Sarah Kim', 'sarah.kim@outlook.com', '0423 567 890',
   'Exercise Bike', 'Precor', NULL,
   NULL, NOW(), NOW()),

  -- 14:00–16:00  Installation (120 min)
  (v_user_id, 'aaaaaaaa-0003-0000-0000-000000000000',
   '2026-04-01', '14:00:00', '16:00:00', 120,
   'completed',
   'Jordan Tan', 'j.tan@yahoo.com', '0434 789 012',
   'Weight Machine', 'Life Fitness', NULL,
   NULL, NOW(), NOW()),

-- ── April 2 (Thursday) ────────────────────────────────────────────────────

  -- 09:00–09:45  Inspection (45 min)
  (v_user_id, 'aaaaaaaa-0004-0000-0000-000000000000',
   '2026-04-02', '09:00:00', '09:45:00', 45,
   'completed',
   'Priya Mehta', 'priya.mehta@gmail.com', '0445 901 234',
   'Elliptical', 'Technogym', 'Annual safety check.',
   NULL, NOW(), NOW()),

  -- 10:30–12:00  Treadmill (90 min) - cancelled
  (v_user_id, 'aaaaaaaa-0001-0000-0000-000000000000',
   '2026-04-02', '10:30:00', '12:00:00', 90,
   'cancelled',
   'Lachlan Foster', 'lachlan.foster@gmail.com', '0456 123 456',
   'Treadmill', 'ProForm', 'Display not turning on, belt feels rough.',
   NULL, NULL, NULL),

-- ── April 3 (Friday) ──────────────────────────────────────────────────────

  -- 10:00–11:15  Elliptical (75 min)
  (v_user_id, 'aaaaaaaa-0005-0000-0000-000000000000',
   '2026-04-03', '10:00:00', '11:15:00', 75,
   'completed',
   'Amy Zhang', 'amy.zhang@gmail.com', '0467 345 678',
   'Elliptical', 'NordicTrack', 'Loud creaking from the left pedal arm.',
   NULL, NOW(), NOW()),

  -- 13:00–14:00  Bike (60 min)
  (v_user_id, 'aaaaaaaa-0002-0000-0000-000000000000',
   '2026-04-03', '13:00:00', '14:00:00', 60,
   'completed',
   'Ryan O''Brien', 'ryan.obrien@hotmail.com', '0478 567 890',
   'Exercise Bike', 'BowFlex', NULL,
   NULL, NOW(), NOW()),

-- ── April 7 (Monday) ──────────────────────────────────────────────────────

  -- 09:00–10:30  Treadmill (90 min)
  (v_user_id, 'aaaaaaaa-0001-0000-0000-000000000000',
   '2026-04-07', '09:00:00', '10:30:00', 90,
   'completed',
   'Natalie Burns', 'natalie.burns@gmail.com', '0489 789 012',
   'Treadmill', 'Life Fitness', 'Speed fluctuating randomly and error code E6 on display.',
   NULL, NOW(), NOW()),

  -- 11:00–11:45  Inspection (45 min)
  (v_user_id, 'aaaaaaaa-0004-0000-0000-000000000000',
   '2026-04-07', '11:00:00', '11:45:00', 45,
   'completed',
   'Daniel Nguyen', 'daniel.nguyen@gmail.com', '0491 901 234',
   'Rowing Machine', 'Concept2', NULL,
   NULL, NOW(), NOW()),

-- ── April 8 (Tuesday) ─────────────────────────────────────────────────────

  -- 09:00–11:00  Installation (120 min)
  (v_user_id, 'aaaaaaaa-0003-0000-0000-000000000000',
   '2026-04-08', '09:00:00', '11:00:00', 120,
   'confirmed',
   'Emma Patel', 'emma.patel@icloud.com', '0402 123 456',
   'Home Gym Station', 'Technogym', NULL,
   NULL, NOW(), NULL),

  -- 13:00–14:15  Elliptical (75 min)
  (v_user_id, 'aaaaaaaa-0005-0000-0000-000000000000',
   '2026-04-08', '13:00:00', '14:15:00', 75,
   'confirmed',
   'Chris Lawson', 'chris.lawson@gmail.com', '0413 345 678',
   'Elliptical', 'Precor', 'Resistance levels 1–5 not responding, jumps straight to 6.',
   NULL, NOW(), NULL),

-- ── April 9 (Wednesday) ───────────────────────────────────────────────────

  -- 10:00–11:00  Bike (60 min)
  (v_user_id, 'aaaaaaaa-0002-0000-0000-000000000000',
   '2026-04-09', '10:00:00', '11:00:00', 60,
   'confirmed',
   'Tina Rhodes', 'tina.rhodes@outlook.com', '0424 567 890',
   'Exercise Bike', 'ProForm', NULL,
   NULL, NOW(), NULL),

  -- 14:00–15:30  Treadmill (90 min)
  (v_user_id, 'aaaaaaaa-0001-0000-0000-000000000000',
   '2026-04-09', '14:00:00', '15:30:00', 90,
   'confirmed',
   'Ben Callahan', 'ben.callahan@gmail.com', '0435 789 012',
   'Treadmill', 'BowFlex', 'Burning smell after 20 minutes of use.',
   NULL, NOW(), NULL),

-- ── April 14 (Monday) ─────────────────────────────────────────────────────

  -- 09:00–10:30  Treadmill (90 min)
  (v_user_id, 'aaaaaaaa-0001-0000-0000-000000000000',
   '2026-04-14', '09:00:00', '10:30:00', 90,
   'pending',
   'Lisa Horton', 'lisa.horton@gmail.com', '0446 901 234',
   'Treadmill', 'NordicTrack', 'Motor running but belt completely stopped moving.',
   NULL, NULL, NULL),

  -- 13:00–15:00  Installation (120 min)
  (v_user_id, 'aaaaaaaa-0003-0000-0000-000000000000',
   '2026-04-14', '13:00:00', '15:00:00', 120,
   'pending',
   'Tom Sinclair', 'tom.sinclair@gmail.com', '0457 123 456',
   'Multi-Station Gym', 'Life Fitness', NULL,
   NULL, NULL, NULL),

-- ── April 15 (Tuesday) ────────────────────────────────────────────────────

  -- 09:30–10:30  Bike (60 min)
  (v_user_id, 'aaaaaaaa-0002-0000-0000-000000000000',
   '2026-04-15', '09:30:00', '10:30:00', 60,
   'pending',
   'Jess Wu', 'jess.wu@gmail.com', '0468 345 678',
   'Exercise Bike', 'Precor', NULL,
   NULL, NULL, NULL),

  -- 11:00–11:45  Inspection (45 min)
  (v_user_id, 'aaaaaaaa-0004-0000-0000-000000000000',
   '2026-04-15', '11:00:00', '11:45:00', 45,
   'pending',
   'Sam Dalton', 'sam.dalton@icloud.com', '0479 567 890',
   'Treadmill', 'ProForm', 'Annual safety inspection due.',
   NULL, NULL, NULL),

-- ── April 22 (Tuesday) ────────────────────────────────────────────────────

  -- 10:00–11:30  Treadmill (90 min)
  (v_user_id, 'aaaaaaaa-0001-0000-0000-000000000000',
   '2026-04-22', '10:00:00', '11:30:00', 90,
   'pending',
   'Holly Marsh', 'holly.marsh@gmail.com', '0490 789 012',
   'Treadmill', 'Technogym', 'Incline motor stuck at maximum elevation.',
   NULL, NULL, NULL),

-- ── April 23 (Wednesday) ──────────────────────────────────────────────────

  -- 09:00–10:00  Bike (60 min)
  (v_user_id, 'aaaaaaaa-0002-0000-0000-000000000000',
   '2026-04-23', '09:00:00', '10:00:00', 60,
   'pending',
   'Alan Frost', 'alan.frost@outlook.com', '0401 901 234',
   'Exercise Bike', 'NordicTrack', NULL,
   NULL, NULL, NULL),

  -- 11:00–12:15  Elliptical (75 min)
  (v_user_id, 'aaaaaaaa-0005-0000-0000-000000000000',
   '2026-04-23', '11:00:00', '12:15:00', 75,
   'pending',
   'Nina Carr', 'nina.carr@gmail.com', '0412 123 456',
   'Elliptical', 'BowFlex', 'Handlebars wobbling and making a loud squeaking noise.',
   NULL, NULL, NULL),

-- ── April 28 (Monday) ─────────────────────────────────────────────────────

  -- 09:00–11:00  Installation (120 min)
  (v_user_id, 'aaaaaaaa-0003-0000-0000-000000000000',
   '2026-04-28', '09:00:00', '11:00:00', 120,
   'pending',
   'Patrick Lim', 'patrick.lim@gmail.com', '0423 345 678',
   'Commercial Bike', 'Life Fitness', NULL,
   NULL, NULL, NULL);

-- ---------------------------------------------------------------------------
-- 4. Summary
-- ---------------------------------------------------------------------------

RAISE NOTICE '✓ Seed complete. Appointments inserted by status:';

END $$;

-- Quick verification query - run this after the seed to confirm:
SELECT
  status,
  COUNT(*) AS count
FROM appointments
WHERE appointment_date BETWEEN '2026-04-01' AND '2026-04-30'
GROUP BY status
ORDER BY status;
