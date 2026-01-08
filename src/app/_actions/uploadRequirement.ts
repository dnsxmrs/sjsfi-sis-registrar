'use server';

import { uploadRequirementFile, deleteRequirementFile } from '@/lib/supabase';

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
    message?: string;
}

interface DeleteResult {
    success: boolean;
    error?: string;
    message?: string;
}

export async function uploadRequirement(formData: FormData): Promise<UploadResult> {
    try {
        const file = formData.get('file') as File;
        const studentId = formData.get('studentId') as string;
        const requirementType = formData.get('requirementType') as string;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        if (!studentId || !requirementType) {
            return { success: false, error: 'Missing studentId or requirementType' };
        }

        // Validate file type (PDF, images, Word docs)
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                success: false,
                error: 'Invalid file type. Only PDF, images, and Word documents are allowed.',
            };
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            return { success: false, error: 'File size exceeds 10MB limit' };
        }

        // Upload file
        const result = await uploadRequirementFile(file, studentId, requirementType);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        return {
            success: true,
            url: result.url,
            message: 'File uploaded successfully',
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function deleteRequirement(fileUrl: string): Promise<DeleteResult> {
    try {
        if (!fileUrl) {
            return { success: false, error: 'No file URL provided' };
        }

        const result = await deleteRequirementFile(fileUrl);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        return {
            success: true,
            message: 'File deleted successfully',
        };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
