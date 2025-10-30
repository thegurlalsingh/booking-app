-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create experiences table
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for experiences (publicly readable)
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences are viewable by everyone" 
ON public.experiences 
FOR SELECT 
USING (true);

-- Create slots table
CREATE TABLE public.slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 10,
  remaining_seats INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experience_id, date, time)
);

-- Enable RLS for slots (publicly readable)
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slots are viewable by everyone" 
ON public.slots 
FOR SELECT 
USING (true);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  promo_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create promos table
CREATE TABLE public.promos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for promos (publicly readable for validation)
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promos are viewable by everyone" 
ON public.promos 
FOR SELECT 
USING (active = true);

-- Insert sample experiences
INSERT INTO public.experiences (name, description, long_description, price, image_url, location) VALUES
('Taj Mahal Sunrise Tour', 'Experience the breathtaking beauty of the Taj Mahal at sunrise', 'Witness one of the Seven Wonders of the World in the golden light of dawn. This exclusive tour includes expert guides, skip-the-line access, and photo opportunities at the best spots. Learn about the rich history and romantic story behind this iconic monument while enjoying the serene morning atmosphere before the crowds arrive.', 2500.00, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop', 'Agra, India'),
('Kerala Backwaters Cruise', 'Peaceful houseboat journey through scenic backwaters', 'Float through the tranquil backwaters of Kerala on a traditional houseboat. Experience village life along the canals, enjoy freshly prepared local cuisine, and relax as you drift past coconut groves and rice paddies. This full-day experience includes lunch, refreshments, and a knowledgeable local guide who will share insights about the unique ecosystem and culture.', 3500.00, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop', 'Kerala, India'),
('Rajasthan Desert Safari', 'Thrilling camel ride and cultural experience in Thar Desert', 'Embark on an unforgettable desert adventure in the golden sands of Rajasthan. Ride camels through stunning dunes, visit traditional villages, and witness a spectacular sunset. The evening includes a traditional Rajasthani dinner, folk music and dance performances, and the opportunity to sleep under the stars in comfortable desert camps.', 4000.00, 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&auto=format&fit=crop', 'Jaisalmer, India'),
('Mumbai Street Food Tour', 'Discover authentic flavors of Mumbai with a local guide', 'Taste your way through Mumbai''s vibrant street food scene with an expert local guide. Sample iconic dishes like vada pav, pav bhaji, bhel puri, and more at the city''s best hidden gems. Learn about the history and culture behind each dish while exploring bustling markets and local neighborhoods. Perfect for food lovers and adventure seekers!', 1500.00, 'https://images.unsplash.com/photo-1554993492-3c6039a4f032?w=800&auto=format&fit=crop', 'Mumbai, India'),
('Varanasi Ganga Aarti', 'Witness the mesmerizing evening prayer ceremony on the Ganges', 'Experience the spiritual heart of India with the spectacular Ganga Aarti ceremony in Varanasi. Watch as priests perform synchronized rituals with fire lamps on the ghats of the holy Ganges River. This deeply moving ceremony, accompanied by chanting and music, takes place at sunset and offers an authentic glimpse into India''s spiritual traditions.', 1200.00, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop', 'Varanasi, India'),
('Goa Beach Yoga Retreat', 'Rejuvenate with sunrise yoga on pristine beaches', 'Start your day with peaceful yoga sessions on Goa''s beautiful beaches. This wellness experience includes professional instruction for all levels, meditation, breathing exercises, and healthy breakfast. Connect with nature, find inner peace, and energize your body while listening to the soothing sound of ocean waves.', 1800.00, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop', 'Goa, India'),
('Himalayan Trek Experience', 'Guided trek through stunning mountain landscapes', 'Journey through breathtaking Himalayan trails with experienced guides. This day trek offers stunning views of snow-capped peaks, passes through traditional mountain villages, and includes interactions with local communities. Suitable for moderate fitness levels, the trek includes packed lunch, safety equipment, and photo opportunities at scenic viewpoints.', 3200.00, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop', 'Himachal Pradesh, India'),
('Jaipur Heritage Walk', 'Explore the Pink City with expert historians', 'Discover the rich heritage of Jaipur through its palaces, forts, and bazaars. This walking tour takes you through the old city, including visits to Hawa Mahal, City Palace, and local craft workshops. Learn about Rajput architecture, royal history, and traditional arts from knowledgeable guides. Includes entrance fees and traditional Rajasthani snacks.', 1600.00, 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop', 'Jaipur, India');

-- Insert sample slots for each experience (next 7 days)
INSERT INTO public.slots (experience_id, date, time, total_seats, remaining_seats)
SELECT 
  e.id,
  CURRENT_DATE + (day_offset || ' days')::interval,
  time_slot,
  10,
  FLOOR(RANDOM() * 8 + 2)::INTEGER
FROM public.experiences e
CROSS JOIN generate_series(0, 6) AS day_offset
CROSS JOIN (VALUES ('06:00 AM'), ('09:00 AM'), ('03:00 PM'), ('05:00 PM')) AS t(time_slot);

-- Insert sample promo codes
INSERT INTO public.promos (code, discount_type, value, active) VALUES
('SAVE10', 'percentage', 10.00, true),
('FLAT100', 'fixed', 100.00, true),
('WELCOME20', 'percentage', 20.00, true);