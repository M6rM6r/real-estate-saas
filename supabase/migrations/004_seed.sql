-- ============================================================
-- Migration 004: Seed data for local development
-- ============================================================

-- Sample tenants
insert into public.tenants (id, slug, name, status, features) values
  ('00000000-0000-0000-0000-000000000001', 'luxe-realty', 'Luxe Realty Group', 'active',
   '{"ai_descriptions": true, "lead_capture": true, "analytics": true, "comparison_tool": true}'),
  ('00000000-0000-0000-0000-000000000002', 'desert-homes', 'Desert Homes UAE', 'active',
   '{"ai_descriptions": true, "lead_capture": true, "analytics": true, "comparison_tool": false}');

-- Profiles
insert into public.profiles (tenant_id, bio, tagline, licence_no, primary_color, contact_email, contact_phone, address, social_links, working_hours) values
  ('00000000-0000-0000-0000-000000000001',
   'Premium real estate agency specializing in luxury properties across Dubai and Abu Dhabi.',
   'Where luxury meets lifestyle',
   'RERA-2024-001',
   '#c9a96e',
   'info@luxerealty.ae',
   '+971501234567',
   'Dubai Marina, Dubai, UAE',
   '{"instagram": "https://instagram.com/luxerealty", "linkedin": "https://linkedin.com/company/luxerealty", "whatsapp": "+971501234567"}',
   '{"monday": {"open": "09:00", "close": "18:00", "active": true}, "tuesday": {"open": "09:00", "close": "18:00", "active": true}, "wednesday": {"open": "09:00", "close": "18:00", "active": true}, "thursday": {"open": "09:00", "close": "18:00", "active": true}, "friday": {"open": "09:00", "close": "13:00", "active": true}, "saturday": {"open": "10:00", "close": "16:00", "active": true}, "sunday": {"active": false}}'
  ),
  ('00000000-0000-0000-0000-000000000002',
   'Your trusted partner for desert and suburban properties in the UAE.',
   'Find your desert home',
   'RERA-2024-002',
   '#e07b39',
   'info@deserthomes.ae',
   '+971502345678',
   'Al Reem Island, Abu Dhabi, UAE',
   '{"instagram": "https://instagram.com/deserthomes", "whatsapp": "+971502345678"}',
   '{"monday": {"open": "09:00", "close": "17:00", "active": true}, "tuesday": {"open": "09:00", "close": "17:00", "active": true}, "wednesday": {"open": "09:00", "close": "17:00", "active": true}, "thursday": {"open": "09:00", "close": "17:00", "active": true}, "friday": {"active": false}, "saturday": {"open": "10:00", "close": "14:00", "active": true}, "sunday": {"active": false}}'
  );

-- Sample listings for Luxe Realty
insert into public.posts (tenant_id, type, title, body, price, location, bedrooms, bathrooms, area_sqm, listing_status, published, published_at, images) values
  ('00000000-0000-0000-0000-000000000001', 'listing', 'Stunning Marina View Penthouse', '<p>A breathtaking penthouse with panoramic views of Dubai Marina. Features floor-to-ceiling windows, a private pool, and world-class amenities.</p>', 8500000, 'Dubai Marina, Dubai', 4, 5, 450, 'available', true, now() - interval '5 days', '[]'),
  ('00000000-0000-0000-0000-000000000001', 'listing', 'Modern Villa in Palm Jumeirah', '<p>Exclusive villa on the iconic Palm Jumeirah with private beach access, smart home technology, and a dedicated parking for 4 cars.</p>', 15000000, 'Palm Jumeirah, Dubai', 5, 6, 820, 'available', true, now() - interval '10 days', '[]'),
  ('00000000-0000-0000-0000-000000000001', 'listing', 'Cozy Studio Downtown', '<p>Modern studio apartment in the heart of Downtown Dubai, walking distance from Burj Khalifa and Dubai Mall.</p>', 950000, 'Downtown Dubai', 0, 1, 55, 'available', true, now() - interval '3 days', '[]'),
  ('00000000-0000-0000-0000-000000000001', 'listing', 'Business Bay Office Suite', '<p>Premium office space in Business Bay with full canal views, private lift lobby, and concierge services.</p>', 3200000, 'Business Bay, Dubai', null, null, 210, 'available', true, now() - interval '7 days', '[]'),
  ('00000000-0000-0000-0000-000000000001', 'listing', 'Arabian Ranches Family Home', '<p>Spacious 3-bedroom villa in the sought-after Arabian Ranches community with a private garden and community pool access.</p>', 2800000, 'Arabian Ranches, Dubai', 3, 3, 280, 'sold', true, now() - interval '20 days', '[]');

-- Sample listings for Desert Homes
insert into public.posts (tenant_id, type, title, body, price, location, bedrooms, bathrooms, area_sqm, listing_status, published, published_at, images) values
  ('00000000-0000-0000-0000-000000000002', 'listing', 'Serene Al Reem Island Apartment', '<p>2-bedroom apartment with sea views in the vibrant Al Reem Island community. Modern finishes and excellent amenities.</p>', 1800000, 'Al Reem Island, Abu Dhabi', 2, 2, 130, 'available', true, now() - interval '4 days', '[]'),
  ('00000000-0000-0000-0000-000000000002', 'listing', 'Khalidiyah Traditional Villa', '<p>Charming traditional villa in the prestigious Khalidiyah district with spacious rooms and a beautiful courtyard garden.</p>', 5500000, 'Khalidiyah, Abu Dhabi', 4, 4, 400, 'available', true, now() - interval '8 days', '[]'),
  ('00000000-0000-0000-0000-000000000002', 'listing', 'Saadiyat Island Beachfront', '<p>Luxurious 3-bedroom apartment steps from the beach at Saadiyat Island. World-class facilities including a spa and private beach club.</p>', 4200000, 'Saadiyat Island, Abu Dhabi', 3, 3, 220, 'rented', true, now() - interval '15 days', '[]'),
  ('00000000-0000-0000-0000-000000000002', 'listing', 'Masdar City Eco Studio', '<p>Sustainable living at its finest. Smart studio in the eco-friendly Masdar City with solar power and zero-carbon footprint.</p>', 680000, 'Masdar City, Abu Dhabi', 0, 1, 48, 'available', true, now() - interval '2 days', '[]'),
  ('00000000-0000-0000-0000-000000000002', 'listing', 'Al Ain Garden Villa', '<p>Beautiful 5-bedroom villa in Al Ain with a massive private garden, mountain views, and traditional Arabic architecture.</p>', 3100000, 'Al Ain, Abu Dhabi', 5, 5, 520, 'available', true, now() - interval '12 days', '[]');
