-- Create professional-images bucket for banner backgrounds and other professional images
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional-images', 'professional-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own images (folder = user_id)
CREATE POLICY "Users can upload their own professional images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'professional-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own professional images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'professional-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own professional images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'professional-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access since bucket is public
CREATE POLICY "Professional images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'professional-images');