import { createClient } from '@supabase/supabase-js';

// Client for public operations (if needed)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Admin client for server-side operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Storage bucket name for student requirements
export const REQUIREMENTS_BUCKET = 'student-requirements';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param studentId - The student's ID
 * @param requirementType - The type of requirement (birthCertificate, f137, etc.)
 * @returns The public URL of the uploaded file
 */
export async function uploadRequirementFile(
    file: File,
    studentId: string,
    requirementType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Create a unique file name
        const now = new Date();
        // Formats to YYYYMMDD
        const readableTimestamp = now.toISOString().split('T')[0].replace(/-/g, '');
        const fileExtension = file.name.split('.').pop();
        const fileName = `${studentId}/${requirementType}-${readableTimestamp}.${fileExtension}`;

        // Upload file to Supabase Storage using admin client (bypasses RLS)
        const { data, error } = await supabaseAdmin.storage
            .from(REQUIREMENTS_BUCKET)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return { success: false, error: error.message };
        }

        // Get public URL (will still work even for private buckets with proper auth)
        const { data: publicUrlData } = supabaseAdmin.storage
            .from(REQUIREMENTS_BUCKET)
            .getPublicUrl(data.path);

        return { success: true, url: publicUrlData.publicUrl };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Failed to upload file' };
    }
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl - The full URL of the file to delete
 * @returns Success status
 */
export async function deleteRequirementFile(
    fileUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Extract the file path from the URL
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split(`/${REQUIREMENTS_BUCKET}/`);
        if (pathParts.length < 2) {
            return { success: false, error: 'Invalid file URL' };
        }
        const filePath = pathParts[1];

        // Delete file from Supabase Storage using admin client
        const { error } = await supabaseAdmin.storage
            .from(REQUIREMENTS_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error('Supabase delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: 'Failed to delete file' };
    }
}
