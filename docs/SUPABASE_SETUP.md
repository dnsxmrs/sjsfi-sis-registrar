# Supabase Storage Setup Instructions

## Overview

Your enrollment system now has file upload functionality using Supabase Storage. Students can upload requirement documents (PDFs, images, Word files) instead of just checking boxes.

## What Was Implemented

### 1. Files Created

- **`src/lib/supabase.ts`** - Supabase client and file upload/delete functions
- **`src/app/api/upload-requirement/route.ts`** - API endpoints for file uploads
- **`src/components/registrar/FileUpload.tsx`** - Reusable file upload component

### 2. Files Modified

- **`src/app/(auth)/registrar/student-application/page.tsx`** - Updated UI to use file uploads
- **`src/app/_actions/studentApplication.ts`** - Updated to save file URLs to database

## Setup Steps

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Project

1. Go to <https://supabase.com> and create a free account
2. Create a new project
3. Wait for project setup to complete (~2 minutes)

### Step 3: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage** → **Buckets**
2. Click **"New Bucket"**
3. Set:
   - **Name**: `student-requirements`
   - **Public**: ✅ Enable (so files are publicly accessible)
4. Click **"Create Bucket"**

### Step 4: Set Bucket Policies

1. Click on the `student-requirements` bucket
2. Go to **Policies** tab
3. Add these policies:

#### Upload Policy

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-requirements');

-- OR allow public uploads (less secure but simpler)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'student-requirements');
```

#### Read Policy (Public Access)

```sql
-- Allow anyone to view files
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-requirements');
```

#### Delete Policy

```sql
-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-requirements');
```

### Step 5: Add Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**

1. Go to your Supabase project
2. Click **Settings** (gear icon) → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 6: Run Your Application

```bash
npm run dev
```

## How It Works

### For Registrars

1. Select a student application from the table
2. Upload required documents using the file upload buttons:
   - Birth Certificate
   - F-137 (Report Card)
   - F-138 (Permanent Record)
   - Certificate of Good Moral
   - Privacy Consent Form
3. Files are uploaded to Supabase Storage automatically
4. Click "Approve Application" to save everything

### File Validation

- **Allowed types**: PDF, JPG, PNG, Word (.doc, .docx)
- **Max size**: 10MB per file
- Files are organized by student ID: `{studentId}/{requirementType}-{timestamp}.{extension}`

### Features

- ✅ Real-time upload progress
- ✅ View uploaded files (opens in new tab)
- ✅ Remove and re-upload files
- ✅ File validation (type and size)
- ✅ Disabled state when no student selected
- ✅ Success/error toast notifications

## Database Schema

The `Requirements` table already has a `fileUrl` field that stores the Supabase URL for each uploaded document.

## Troubleshooting

### "Missing Supabase environment variables"

- Make sure `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding env variables

### "Upload failed" errors

1. Check Supabase dashboard → Storage → student-requirements bucket exists
2. Verify bucket policies are set correctly
3. Check browser console for detailed error messages

### Files not accessible

- Ensure the bucket is set to **Public**
- Check the "Allow public access" policy is enabled

### CORS errors

- Supabase automatically handles CORS for public buckets
- If issues persist, add your domain in Supabase → Settings → API → CORS

## Free Tier Limits

Supabase Free Tier includes:

- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **Unlimited**: API requests

This should be sufficient for a school enrollment system with moderate usage.

## Security Notes

- Files are stored with student IDs, maintaining organization
- Bucket policies control who can upload/view/delete
- File validation prevents malicious uploads
- Consider adding file scanning for production use

## Next Steps (Optional Enhancements)

1. **Add file previews** for images/PDFs in the UI
2. **Implement file compression** to save storage space
3. **Add virus scanning** using a service like ClamAV
4. **Create admin panel** to manage all uploaded files
5. **Add audit logging** for file uploads/deletions
6. **Implement file versioning** if documents need updates
