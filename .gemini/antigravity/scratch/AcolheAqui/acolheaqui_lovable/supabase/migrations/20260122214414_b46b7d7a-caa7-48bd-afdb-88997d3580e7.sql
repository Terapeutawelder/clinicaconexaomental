-- Add INSERT policy for member-videos bucket (was missing)
CREATE POLICY "Professionals can upload to their folder" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'member-videos' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);