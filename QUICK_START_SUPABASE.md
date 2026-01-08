# Quick Start Guide - Supabase File Uploads

## 🚀 Quick Setup (5 minutes)

### 1. Install Package

```bash
npm install @supabase/supabase-js
```

### 2. Get Supabase Credentials

1. Go to <https://supabase.com>
2. Create free account & new project
3. Go to Settings → API
4. Copy: Project URL & anon public key

### 3. Add to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Create Storage Bucket

In Supabase Dashboard:

1. Storage → New Bucket
2. Name: `student-requirements`
3. ✅ Make it Public
4. Create

### 5. Set Policies (in Supabase SQL Editor)

```sql
-- Allow public uploads
CREATE POLICY "Public uploads" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'student-requirements');

-- Allow public reads
CREATE POLICY "Public reads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'student-requirements');

-- Allow public deletes
CREATE POLICY "Public deletes" ON storage.objects
FOR DELETE TO public
USING (bucket_id = 'student-requirements');
```

### 6. Run

```bash
npm run dev
```

## ✅ That's it

## 📋 How It Works

### Upload Flow

1. **Select Files** - Registrar selects documents (PDF, images, Word files)
2. **Files Staged** - Files are validated and staged locally (not uploaded yet)
3. **Click "Approve Application"** - All selected files are uploaded to Supabase
4. **File URLs Saved** - URLs are stored in the database with the application

### Key Features

- ✅ Select files first, upload on approval
- ✅ Real-time upload progress with toast notifications
- ✅ PDF, JPG, PNG, Word files (max 10MB each)
- ✅ View and remove selected files before approval
- ✅ Files organized by student ID in Supabase

## 📁 File Structure

```tree
student-requirements/
  ├── SJSFI-2025-0001/
  │   ├── birthCertificate-1234567890.pdf
  │   ├── f137-1234567891.jpg
  │   └── goodMoral-1234567892.docx
  └── SJSFI-2025-0002/
      └── ...
```

## 🔧 Technical Details

- Files are selected and validated locally first
- Upload happens only when "Approve Application" is clicked
- Each file uploads sequentially with progress notifications
- All URLs are saved to the Requirements table in database
- Server actions used instead of API routes (better performance)

## 🆘 Need Help?

See full documentation in `SUPABASE_SETUP.md`
