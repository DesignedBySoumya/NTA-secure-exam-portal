-- Allow read access to all users for exam-documents
CREATE POLICY "Public Access to exam-documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'exam-documents');

-- Allow uploads to all users for exam-documents
CREATE POLICY "Allow Uploads to exam-documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'exam-documents');

-- Allow updates to all users for exam-documents
CREATE POLICY "Allow Updates to exam-documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'exam-documents');

-- Allow read access to all users for exam-papers
CREATE POLICY "Public Access to exam-papers" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'exam-papers');

-- Allow uploads to all users for exam-papers
CREATE POLICY "Allow Uploads to exam-papers" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'exam-papers');

-- Allow updates to all users for exam-papers
CREATE POLICY "Allow Updates to exam-papers" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'exam-papers');
