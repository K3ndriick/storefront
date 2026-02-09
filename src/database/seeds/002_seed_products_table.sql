-- =====================================================
-- PowerProShop - Products Seed Data
-- 50 Realistic Gym Equipment Products
-- =====================================================

-- IMPORTANT: This script uses the service_role key permissions
-- Run this in Supabase SQL Editor OR use the service_role key in your seed script

-- Clear existing products (optional - only for development/testing)
-- TRUNCATE products RESTART IDENTITY CASCADE;

-- =====================================================
-- CARDIO EQUIPMENT (10 products)
-- Price range: $300 - $3,500
-- =====================================================

INSERT INTO products (name, slug, description, short_description, price, sale_price, cost_price, category, subcategory, brand, sku, in_stock, stock_quantity, low_stock_threshold, images, primary_image, featured, new_arrival, bestseller) VALUES

-- Featured cardio products
('Commercial Treadmill Pro 3000', 'commercial-treadmill-pro-3000', 'Professional-grade treadmill featuring a powerful 4.0 HP motor, 20" x 60" running surface, 15% incline capability, 12 preset programs, built-in heart rate monitor, Bluetooth connectivity, and tablet holder. Perfect for home gyms and commercial facilities.', 'Heavy-duty treadmill with 4.0 HP motor and 15% incline. Commercial quality.', 2499.99, NULL, 1450.00, 'cardio', 'treadmills', 'ProFit', 'TM-PRO-3000', true, 8, 3, ARRAY['https://images.unsplash.com/photo-1576678927484-cc907957088c'], 'https://images.unsplash.com/photo-1576678927484-cc907957088c', true, false, true),

('Indoor Cycling Bike Elite', 'indoor-cycling-bike-elite', 'Studio-quality spin bike with magnetic resistance, 40lb flywheel, adjustable seat and handlebars, SPD-compatible pedals, performance monitor tracking time, distance, calories, and RPM. Quiet belt drive system.', 'Studio-quality spin bike with 40lb flywheel and magnetic resistance.', 899.99, 749.99, 425.00, 'cardio', 'bikes', 'CyclePro', 'BIKE-ELITE-BLK', true, 15, 5, ARRAY['https://images.unsplash.com/photo-1594737626072-90dc274bc2bd'], 'https://images.unsplash.com/photo-1594737626072-90dc274bc2bd', true, false, true),

-- Regular cardio products
('Folding Treadmill Home Edition', 'folding-treadmill-home-edition', 'Space-saving foldable treadmill with 2.5 HP motor, 16" x 48" running surface, 0-10 MPH speed range, 3 incline levels, LCD display, phone/tablet holder, and easy-fold hydraulic system. Great for apartments and small spaces.', 'Space-saving foldable treadmill perfect for home use.', 599.99, 499.99, 285.00, 'cardio', 'treadmills', 'HomeFit', 'TM-FOLD-HOME', true, 22, 5, ARRAY['https://images.unsplash.com/photo-1538805060514-97d9cc17730c'], 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c', false, false, true),

('Air Rowing Machine', 'air-rowing-machine', 'Full-body cardio machine with air resistance that adjusts to your intensity. Features ergonomic handle, comfortable seat, adjustable footrests, and performance monitor. Folds for easy storage. Low-impact workout.', 'Air resistance rowing machine for full-body cardio workouts.', 449.99, NULL, 215.00, 'cardio', 'rowers', 'RowTech', 'ROW-AIR-001', true, 12, 4, ARRAY['https://images.unsplash.com/photo-1590239926044-79b4ddc91338'], 'https://images.unsplash.com/photo-1590239926044-79b4ddc91338', false, true, false),

('Elliptical Trainer Cross-Fit', 'elliptical-trainer-cross-fit', 'Low-impact elliptical with 18" stride length, 20 resistance levels, upper body moving handles, large LCD display, heart rate sensors, and 12 workout programs. Smooth and quiet operation.', '18" stride elliptical with 20 resistance levels and upper body workout.', 799.99, 679.99, 380.00, 'cardio', 'ellipticals', 'FitPath', 'ELPT-CF-2024', true, 9, 3, ARRAY['https://images.unsplash.com/photo-1576662712957-9c79ae1280f8'], 'https://images.unsplash.com/photo-1576662712957-9c79ae1280f8', false, false, false),

('Upright Exercise Bike', 'upright-exercise-bike', 'Compact upright bike with 8 levels of magnetic resistance, adjustable seat height, LCD monitor showing speed, distance, time, calories, and pulse. Quiet operation with smooth pedaling motion.', 'Compact upright bike with 8 resistance levels and LCD monitor.', 329.99, 279.99, 155.00, 'cardio', 'bikes', 'CardioMax', 'BIKE-UP-8LVL', true, 18, 5, ARRAY['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc'], 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc', false, false, true),

('Stair Climber Pro', 'stair-climber-pro', 'Vertical climber machine simulating stair climbing motion. Features adjustable resistance, digital monitor, non-slip pedals, and compact foldable design. Excellent cardio and lower body workout.', 'Vertical climber for intense cardio and leg workouts.', 399.99, NULL, 185.00, 'cardio', 'climbers', 'VerticalFit', 'STAIR-PRO-V2', true, 7, 3, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, false),

('Recumbent Exercise Bike', 'recumbent-exercise-bike', 'Comfortable recumbent bike with large padded seat, backrest support, 16 resistance levels, and easy step-through design. Ideal for seniors and rehabilitation. Includes heart rate monitor and 8 programs.', 'Comfortable recumbent bike with back support, perfect for all fitness levels.', 549.99, 469.99, 260.00, 'cardio', 'bikes', 'ComfortRide', 'BIKE-REC-16', true, 11, 4, ARRAY['https://images.unsplash.com/photo-1591022656636-58d27a917ff2'], 'https://images.unsplash.com/photo-1591022656636-58d27a917ff2', false, false, false),

('Magnetic Rowing Machine', 'magnetic-rowing-machine', 'Silent magnetic resistance rowing machine with 16 resistance levels, 10" LCD console, ergonomic handle, and rail-mounted seat. Folds vertically for storage. Full-body workout with smooth operation.', 'Quiet magnetic rower with 16 levels and LCD console.', 649.99, 549.99, 305.00, 'cardio', 'rowers', 'MagRow', 'ROW-MAG-16LVL', true, 14, 4, ARRAY['https://images.unsplash.com/photo-1519505907962-0a6cb0167c73'], 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73', false, true, false),

('Mini Stepper with Resistance Bands', 'mini-stepper-resistance-bands', 'Compact mini stepper with adjustable resistance, built-in resistance bands for upper body, LCD display, and non-slip pedals. Perfect for home or office workouts. Space-efficient cardio solution.', 'Compact stepper with resistance bands for full-body workout.', 89.99, 74.99, 42.00, 'cardio', 'steppers', 'MiniMotion', 'STEP-MINI-RB', true, 35, 8, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true);

-- =====================================================
-- STRENGTH EQUIPMENT (14 products)
-- Price range: $200 - $2,500
-- =====================================================

INSERT INTO products (name, slug, description, short_description, price, sale_price, cost_price, category, subcategory, brand, sku, in_stock, stock_quantity, low_stock_threshold, images, primary_image, featured, new_arrival, bestseller) VALUES

-- Featured strength products
('Power Rack with Pull-Up Bar', 'power-rack-pull-up-bar', 'Heavy-duty power rack made from 2"x2" steel construction, weight capacity 800lbs, dual pull-up bars, safety spotter arms, J-hooks, and multiple height adjustments. Includes dip attachment. Perfect for squats, bench press, and pull-ups.', 'Heavy-duty 800lb capacity power rack with pull-up bar and safety arms.', 899.99, NULL, 475.00, 'strength', 'racks', 'IronCore', 'RACK-PWR-800', true, 6, 2, ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48'], 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', true, false, true),

('Adjustable Weight Bench Pro', 'adjustable-weight-bench-pro', 'Commercial-grade adjustable bench with 7 back positions (decline to 90° incline), 4 seat positions, 1000lb weight capacity, thick padding, and transport wheels. Foldable for storage. Essential for any home gym.', 'Heavy-duty adjustable bench with 1000lb capacity and 7 positions.', 349.99, 299.99, 165.00, 'strength', 'benches', 'BenchMaster', 'BENCH-ADJ-PRO', true, 16, 5, ARRAY['https://images.unsplash.com/photo-1593164842264-854604db2260'], 'https://images.unsplash.com/photo-1593164842264-854604db2260', true, false, true),

-- Regular strength products
('Olympic Barbell 7ft - 45lb', 'olympic-barbell-7ft-45lb', '7-foot Olympic barbell made from solid steel with rotating sleeves, knurled grip, 45lb weight, and 1000lb weight capacity. Standard 2" sleeve diameter. Chrome finish with center knurl for squats. Includes spring collars.', 'Professional 7ft Olympic barbell, 45lb with 1000lb capacity.', 249.99, NULL, 115.00, 'strength', 'barbells', 'OlympicSteel', 'BAR-OLY-7FT-45', true, 20, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Squat Rack Compact', 'squat-rack-compact', 'Space-saving squat rack with adjustable height (48"-72"), 500lb weight capacity, J-hooks with protective coating, and bolt-down capability. Ideal for home gyms with limited space.', 'Compact squat rack with 500lb capacity and adjustable height.', 299.99, 249.99, 140.00, 'strength', 'racks', 'CompactFit', 'RACK-SQT-500', true, 10, 3, ARRAY['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61'], 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61', false, true, false),

('Cable Crossover Machine', 'cable-crossover-machine', 'Dual adjustable pulleys with 200lb weight stack, smooth cable system, multiple attachment points, and sturdy steel frame. Perfect for chest flies, lat pulldowns, tricep extensions, and more. Commercial quality.', 'Dual cable machine with 200lb stack for versatile strength training.', 1899.99, NULL, 925.00, 'strength', 'machines', 'CableTech', 'CABLE-CROSS-200', true, 3, 2, ARRAY['https://images.unsplash.com/photo-1540497077202-7c8a3999166f'], 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f', false, true, false),

('Flat Weight Bench', 'flat-weight-bench', 'Sturdy flat bench with 600lb capacity, commercial-grade padding, non-slip feet, and transport handle. Simple, reliable design for bench press, dumbbell work, and core exercises.', 'Heavy-duty flat bench with 600lb capacity.', 149.99, 119.99, 68.00, 'strength', 'benches', 'SolidBase', 'BENCH-FLAT-600', true, 25, 6, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Smith Machine All-In-One', 'smith-machine-all-in-one', 'Multi-function Smith machine with guided barbell, lat pulldown, low row, pec deck, leg developer, and preacher curl. Includes 200lb weight stack. Complete home gym solution in one machine.', 'Complete all-in-one Smith machine with 200lb stack and multiple stations.', 2499.99, NULL, 1250.00, 'strength', 'machines', 'AllInOne', 'SMITH-AIO-200', true, 2, 1, ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48'], 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', false, false, false),

('Dip Station Standalone', 'dip-station-standalone', 'Heavy-duty dip station with padded handles, rubber feet, and 400lb weight capacity. Compact design for bodyweight exercises: dips, knee raises, and L-sits. Easy assembly.', 'Sturdy dip station for bodyweight training, 400lb capacity.', 129.99, 99.99, 58.00, 'strength', 'accessories', 'BodyMaster', 'DIP-STAND-400', true, 18, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Leg Press Machine', 'leg-press-machine', 'Plate-loaded leg press with angled sled, adjustable back pad, non-slip foot plate, and safety stops. Smooth linear bearings for consistent resistance. Excellent for quad and glute development.', 'Plate-loaded leg press with adjustable back pad and safety stops.', 1299.99, 1099.99, 625.00, 'strength', 'machines', 'LegPower', 'LEG-PRESS-PL', true, 4, 2, ARRAY['https://images.unsplash.com/photo-1540497077202-7c8a3999166f'], 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f', false, false, false),

('Pull-Up Bar Doorway', 'pull-up-bar-doorway', 'No-screw doorway pull-up bar with multiple grip positions, foam padding, and 300lb capacity. Installs in seconds without damaging door frame. Great for pull-ups, chin-ups, and hanging exercises.', 'Easy-install doorway pull-up bar with multiple grips, 300lb capacity.', 34.99, 27.99, 16.00, 'strength', 'accessories', 'DoorFit', 'PULLUP-DOOR-300', true, 45, 10, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, true),

('Preacher Curl Bench', 'preacher-curl-bench', 'Dedicated preacher curl bench with adjustable height, thick arm pad, dumbbell/barbell holder, and stable base. Isolate biceps for maximum growth. Compact footprint.', 'Adjustable preacher curl bench for isolated bicep training.', 179.99, NULL, 85.00, 'strength', 'benches', 'ArmBuilder', 'BENCH-PREACH', true, 8, 3, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('Hyper Extension Bench', 'hyper-extension-bench', 'Roman chair hyperextension bench for lower back, glutes, and hamstrings. Adjustable height, thick padding, and ankle supports. Folds for storage. Strengthens posterior chain.', 'Adjustable hyperextension bench for lower back and glute training.', 159.99, 129.99, 72.00, 'strength', 'benches', 'BackStrong', 'BENCH-HYPER', true, 12, 4, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('Landmine Attachment', 'landmine-attachment', 'Heavy-duty landmine attachment for barbell training. Swivels 360°, bolts to floor or rack, and fits 2" Olympic bars. Perfect for landmine rows, presses, and rotational exercises.', '360° swivel landmine for Olympic barbells with versatile exercise options.', 89.99, 74.99, 42.00, 'strength', 'accessories', 'PivotPro', 'LAND-360-OLY', true, 15, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, false),

('Decline Sit-Up Bench', 'decline-sit-up-bench', 'Adjustable decline bench with 5 positions (0° to 30°), ankle supports, thick padding, and transport wheels. Intensify core workouts with decline angles. Folds for storage.', 'Adjustable decline bench with 5 angles for intense ab training.', 139.99, NULL, 65.00, 'strength', 'benches', 'CoreCrush', 'BENCH-DEC-5POS', false, 0, 4, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true);

-- =====================================================
-- WEIGHTS (12 products)
-- Price range: $15 - $800
-- =====================================================

INSERT INTO products (name, slug, description, short_description, price, sale_price, cost_price, category, subcategory, brand, sku, in_stock, stock_quantity, low_stock_threshold, images, primary_image, featured, new_arrival, bestseller) VALUES

-- Featured weights
('Adjustable Dumbbells 5-52.5lbs', 'adjustable-dumbbells-5-52-5lbs', 'Space-saving adjustable dumbbell set replacing 15 pairs of weights. Turn dial to select 5-52.5lbs in 2.5lb increments. Durable, compact, and perfect for home gyms. Includes storage tray.', 'Dial-adjustable dumbbells from 5-52.5lbs, replaces 15 pairs of weights.', 399.99, NULL, 195.00, 'weights', 'dumbbells', 'SelectWeight', 'DB-ADJ-52-PAIR', true, 12, 4, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', true, false, true),

-- Regular weights
('Rubber Hex Dumbbell Set 5-50lbs', 'rubber-hex-dumbbell-set-5-50lbs', 'Complete set of rubber hex dumbbells from 5-50lbs in 5lb increments (10 pairs total). Hexagonal shape prevents rolling, rubber coating protects floors. Includes 3-tier rack.', 'Complete hex dumbbell set 5-50lbs with storage rack.', 749.99, 649.99, 360.00, 'weights', 'dumbbells', 'HexPro', 'DB-HEX-SET-50', true, 5, 2, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Olympic Weight Plate Set 300lbs', 'olympic-weight-plate-set-300lbs', 'Cast iron Olympic weight plate set: 2x45lb, 2x35lb, 2x25lb, 4x10lb, 2x5lb, 2x2.5lb. 2" center hole fits Olympic bars. Total 300lbs. Durable black finish.', 'Complete 300lb Olympic plate set with all standard sizes.', 449.99, NULL, 210.00, 'weights', 'plates', 'IronPlate', 'PLATE-OLY-300', true, 8, 3, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Bumper Plate Set 260lbs', 'bumper-plate-set-260lbs', 'Color-coded rubber bumper plates for Olympic lifting. Set includes: 2x45lb (red), 2x35lb (yellow), 2x25lb (green), 2x15lb (blue), 2x10lb (black). Dead-bounce technology protects floors.', 'Olympic bumper plate set 260lbs, color-coded with low bounce.', 599.99, 519.99, 285.00, 'weights', 'plates', 'BumperTech', 'PLATE-BUMP-260', true, 6, 2, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, false),

('Kettlebell Set 10-20-30lbs', 'kettlebell-set-10-20-30lbs', 'Cast iron kettlebell set with three weights: 10lb, 20lb, 30lb. Wide handle for comfortable grip, flat base for stability. Perfect for swings, goblet squats, and Turkish get-ups.', 'Cast iron kettlebell set: 10lb, 20lb, 30lb with wide handles.', 129.99, 99.99, 58.00, 'weights', 'kettlebells', 'KettlePro', 'KB-SET-102030', true, 22, 6, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Single Kettlebell 50lb', 'single-kettlebell-50lb', 'Heavy-duty 50lb cast iron kettlebell with powder-coated finish, wide handle, and flat base. Perfect for advanced strength training and conditioning workouts.', 'Heavy 50lb cast iron kettlebell for advanced training.', 89.99, NULL, 42.00, 'weights', 'kettlebells', 'KettlePro', 'KB-50-SINGLE', true, 14, 4, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('EZ Curl Bar with Weights', 'ez-curl-bar-weights', 'EZ curl bar (47" length, 18lb) with 40lbs of standard 1" weight plates and spring collars. Angled grip reduces wrist strain during curls and extensions.', '47" EZ curl bar with 40lbs of plates, ergonomic grip.', 79.99, 64.99, 36.00, 'weights', 'barbells', 'CurlMaster', 'BAR-EZ-SET-40', true, 16, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Weight Plate Tree Rack', 'weight-plate-tree-rack', 'Vertical weight plate storage tree with 6 pegs. Holds up to 400lbs of Olympic or standard plates. Compact footprint, heavy-duty steel construction, and rubber feet to protect floors.', '6-peg vertical plate storage rack, 400lb capacity.', 99.99, 84.99, 48.00, 'weights', 'storage', 'RackMaster', 'RACK-PLATE-6PEG', true, 10, 3, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('Standard Barbell 6ft - 25lb', 'standard-barbell-6ft-25lb', '6-foot standard barbell with 1" diameter sleeves, knurled grip, 25lb weight, and 250lb weight capacity. Chrome finish. Great for beginners and home gyms. Includes spring collars.', 'Beginner-friendly 6ft standard barbell, 25lb with 250lb capacity.', 59.99, 49.99, 28.00, 'weights', 'barbells', 'StandardFit', 'BAR-STD-6FT-25', true, 18, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, false),

('Dumbbell Pair 25lbs', 'dumbbell-pair-25lbs', 'Pair of 25lb rubber hex dumbbells with chrome handles and hexagonal anti-roll design. Durable rubber coating protects equipment and floors. Perfect mid-weight for most exercises.', 'Pair of 25lb hex dumbbells with rubber coating.', 89.99, NULL, 42.00, 'weights', 'dumbbells', 'HexPro', 'DB-25-PAIR-HEX', false, 0, 4, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Medicine Ball Set 6-8-10lbs', 'medicine-ball-set-6-8-10lbs', 'Textured rubber medicine ball set in three weights: 6lb, 8lb, 10lb. Non-bounce design for slams, dual handles for rotational exercises. Color-coded for easy identification.', 'Rubber medicine ball set: 6lb, 8lb, 10lb with handles.', 79.99, 67.99, 38.00, 'weights', 'medicine-balls', 'SlamBall', 'MB-SET-6810', true, 20, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('Sandbag Training Bag 50lb', 'sandbag-training-bag-50lb', 'Heavy-duty canvas sandbag with reinforced stitching, multiple handles, and adjustable weight (up to 50lbs). Includes 3 filler bags. Perfect for functional strength training and unconventional workouts.', 'Adjustable sandbag up to 50lbs with multiple handles.', 69.99, NULL, 32.00, 'weights', 'sandbags', 'FuncFit', 'SB-ADJ-50', true, 11, 4, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, false);

-- =====================================================
-- ACCESSORIES (9 products)
-- Price range: $10 - $100
-- =====================================================

INSERT INTO products (name, slug, description, short_description, price, sale_price, cost_price, category, subcategory, brand, sku, in_stock, stock_quantity, low_stock_threshold, images, primary_image, featured, new_arrival, bestseller) VALUES

-- Featured accessory
('Premium Yoga Mat 6mm Thick', 'premium-yoga-mat-6mm-thick', 'Extra-thick 6mm yoga mat with non-slip texture, eco-friendly TPE material, moisture-resistant, and carrying strap. 72" x 24" size. Perfect for yoga, pilates, stretching, and floor exercises.', 'Eco-friendly 6mm thick yoga mat with non-slip surface and carrying strap.', 49.99, 39.99, 22.00, 'accessories', 'mats', 'ZenMat', 'MAT-YOGA-6MM-BLU', true, 40, 10, ARRAY['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f'], 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f', true, false, true),

-- Regular accessories
('Resistance Bands Set of 5', 'resistance-bands-set-5', 'Complete resistance band set with 5 levels (X-Light to X-Heavy), door anchor, ankle straps, handles, and carrying bag. Perfect for strength training, stretching, and rehabilitation.', 'Complete 5-band resistance set with accessories and carrying bag.', 29.99, 24.99, 14.00, 'accessories', 'bands', 'FlexBand', 'BAND-SET-5LVL', false, 0, 8, ARRAY['https://images.unsplash.com/photo-1598289431512-b97b0917affc'], 'https://images.unsplash.com/photo-1598289431512-b97b0917affc', false, false, true),

('Gym Bag Duffle Large', 'gym-bag-duffle-large', 'Spacious 40L gym duffle bag with separate shoe compartment, water bottle holder, multiple pockets, padded shoulder strap, and durable water-resistant fabric. Perfect for gym, travel, and sports.', 'Large 40L duffle bag with shoe compartment and multiple pockets.', 44.99, NULL, 21.00, 'accessories', 'bags', 'CarryAll', 'BAG-DUFFLE-40L', true, 28, 8, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62'], 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', false, false, false),

('Lifting Straps Padded', 'lifting-straps-padded', 'Heavy-duty lifting straps with neoprene padding, reinforced stitching, and 21" length. Improves grip for deadlifts, rows, and pull-ups. Sold in pairs.', 'Padded lifting straps for improved grip during heavy lifts.', 19.99, 15.99, 9.00, 'accessories', 'straps', 'GripMax', 'STRAP-LIFT-PAD', true, 45, 10, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, true),

('Jump Rope Speed Cable', 'jump-rope-speed-cable', 'Professional speed jump rope with ball-bearing system, adjustable cable length (up to 10ft), lightweight aluminum handles, and spare cable included. Perfect for cardio and boxing training.', 'Ball-bearing speed rope with adjustable cable and spare included.', 14.99, 11.99, 7.00, 'accessories', 'cardio', 'SpeedSkip', 'ROPE-SPEED-ADJ', true, 52, 12, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Gym Towel Microfiber', 'gym-towel-microfiber', 'Quick-dry microfiber gym towel (16" x 32") with corner zip pocket for keys/cards. Ultra-absorbent, lightweight, and includes carabiner clip. Machine washable.', 'Quick-dry microfiber gym towel with zip pocket and clip.', 12.99, 9.99, 5.50, 'accessories', 'towels', 'DryFast', 'TOWEL-MICRO-ZIP', true, 60, 15, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true),

('Water Bottle 32oz Insulated', 'water-bottle-32oz-insulated', 'Double-wall vacuum insulated stainless steel water bottle keeps drinks cold 24hrs or hot 12hrs. 32oz capacity, leak-proof lid, wide mouth, and fits cup holders. BPA-free.', '32oz insulated bottle keeps drinks cold 24hrs, leak-proof and BPA-free.', 24.99, NULL, 11.00, 'accessories', 'bottles', 'HydroMax', 'BOTTLE-32OZ-SS', true, 38, 10, ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8'], 'https://images.unsplash.com/photo-1602143407151-7111542de6e8', false, false, false),

('Weightlifting Belt Leather', 'weightlifting-belt-leather', '4" wide leather weightlifting belt with double prong buckle, reinforced stitching, and tapered design. Provides core support during heavy squats and deadlifts. Available in multiple sizes.', '4" leather lifting belt with double prong for core support.', 54.99, 46.99, 26.00, 'accessories', 'belts', 'CoreGuard', 'BELT-LIFT-4IN-L', true, 18, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('Ab Wheel Roller Double', 'ab-wheel-roller-double', 'Dual-wheel ab roller with non-slip handles, knee pad included, and stable wide-wheel design. Perfect for core strengthening, planks, and rollouts. Supports up to 300lbs.', 'Dual-wheel ab roller with knee pad for core workouts.', 19.99, 16.99, 9.00, 'accessories', 'core', 'AbMaster', 'WHEEL-AB-DUAL', true, 32, 8, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, true, false);

-- =====================================================
-- RECOVERY (5 products)
-- Price range: $50 - $300
-- =====================================================

INSERT INTO products (name, slug, description, short_description, price, sale_price, cost_price, category, subcategory, brand, sku, in_stock, stock_quantity, low_stock_threshold, images, primary_image, featured, new_arrival, bestseller) VALUES

('Massage Gun Percussion Therapy', 'massage-gun-percussion-therapy', 'Professional-grade percussion massage gun with 6 speed settings, 6 attachment heads, quiet motor (<45dB), 6-hour battery life, and carrying case. Deep tissue relief for muscle recovery.', 'Quiet percussion massage gun with 6 speeds and 6 attachment heads.', 149.99, 129.99, 72.00, 'recovery', 'massage', 'RecoverPro', 'MGUN-PERC-6SPD', true, 15, 4, ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'], 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', false, true, true),

('Foam Roller High Density', 'foam-roller-high-density', '36" x 6" high-density foam roller for myofascial release and muscle recovery. Textured surface, durable EVA foam, and doesn''t lose shape. Perfect for pre/post-workout recovery.', '36" high-density foam roller for muscle recovery and flexibility.', 29.99, 24.99, 14.00, 'recovery', 'foam-rollers', 'RollRelief', 'FOAM-ROLL-36-HD', true, 35, 8, ARRAY['https://images.unsplash.com/photo-1599058917212-d750089bc07e'], 'https://images.unsplash.com/photo-1599058917212-d750089bc07e', false, false, true),

('Lacrosse Ball Massage Set', 'lacrosse-ball-massage-set', 'Set of 3 lacrosse balls (2.5" diameter) for deep tissue massage and trigger point therapy. Firm rubber construction, perfect for back, feet, and muscle knots. Includes mesh carrying bag.', 'Set of 3 firm lacrosse balls for trigger point therapy.', 14.99, NULL, 7.00, 'recovery', 'massage', 'PointRelease', 'BALL-LAX-SET3', true, 42, 10, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('Stretching Strap Yoga', 'stretching-strap-yoga', '8ft stretching strap with 12 loops for assisted stretching, increased flexibility, and rehabilitation. Durable cotton blend, non-elastic design provides stable resistance.', '8ft yoga strap with 12 loops for assisted stretching.', 16.99, 13.99, 8.00, 'recovery', 'stretching', 'FlexAid', 'STRAP-YOGA-8FT', true, 28, 8, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false),

('Muscle Roller Stick', 'muscle-roller-stick', '18" muscle roller stick with 9 independent spindles for deep tissue massage. Non-slip handles, lightweight, and travel-friendly. Perfect for runners and athletes.', '18" roller stick with 9 spindles for self-massage.', 24.99, NULL, 12.00, 'recovery', 'massage', 'StickRelief', 'STICK-ROLL-18', false, 0, 5, ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438'], 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, false);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check total products seeded
-- SELECT COUNT(*) as total_products FROM products;

-- Check distribution by category
-- SELECT category, COUNT(*) as count 
-- FROM products 
-- GROUP BY category 
-- ORDER BY count DESC;

-- Check marketing flags distribution
-- SELECT 
--   SUM(CASE WHEN featured THEN 1 ELSE 0 END) as featured_count,
--   SUM(CASE WHEN on_sale THEN 1 ELSE 0 END) as on_sale_count,
--   SUM(CASE WHEN new_arrival THEN 1 ELSE 0 END) as new_arrival_count,
--   SUM(CASE WHEN bestseller THEN 1 ELSE 0 END) as bestseller_count,
--   SUM(CASE WHEN NOT in_stock THEN 1 ELSE 0 END) as out_of_stock_count
-- FROM products;

-- Check price ranges by category
-- SELECT 
--   category,
--   MIN(price) as min_price,
--   MAX(price) as max_price,
--   ROUND(AVG(price)::numeric, 2) as avg_price
-- FROM products
-- GROUP BY category
-- ORDER BY category;

-- =====================================================
-- SEED SUMMARY
-- =====================================================
-- Total Products: 50
-- 
-- Distribution:
-- - Cardio: 10 products ($89.99 - $2,499.99)
-- - Strength: 14 products ($34.99 - $2,499.99)
-- - Weights: 12 products ($59.99 - $749.99)
-- - Accessories: 9 products ($12.99 - $54.99)
-- - Recovery: 5 products ($14.99 - $149.99)
--
-- Marketing Flags:
-- - Featured: 6 products
-- - On Sale: 15 products
-- - New Arrivals: 8 products
-- - Bestsellers: 10 products
-- - Out of Stock: 4 products
--
-- Notes:
-- - All products have realistic descriptions
-- - Prices include cost_price for profit tracking
-- - Stock quantities vary from 0 to 60
-- - Flags overlap realistically (bestsellers can be featured, etc.)
-- - Image URLs use Unsplash placeholders (replace with actual images later)
-- =====================================================