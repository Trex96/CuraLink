import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'publications');
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf'];

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(researcherId: string): Promise<string> {
    const userUploadDir = path.join(UPLOAD_DIR, researcherId);

    if (!fs.existsSync(userUploadDir)) {
        fs.mkdirSync(userUploadDir, { recursive: true });
    }

    return userUploadDir;
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    return `pub_${timestamp}_${randomString}${ext}`;
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string): boolean {
    return ALLOWED_FILE_TYPES.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): boolean {
    return size <= MAX_FILE_SIZE;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Delete file from file system
 */
export async function deleteFile(filePath: string): Promise<boolean> {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

/**
 * Save uploaded file
 */
export async function saveUploadedFile(
    file: File,
    researcherId: string
): Promise<{ filePath: string; filename: string }> {
    const uploadDir = await ensureUploadDir(researcherId);
    const filename = generateUniqueFilename(file.name);
    const filePath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(filePath, buffer);

    return { filePath, filename };
}

/**
 * Get relative file path for storage in database
 */
export function getRelativeFilePath(researcherId: string, filename: string): string {
    return path.join('uploads', 'publications', researcherId, filename);
}

/**
 * Get absolute file path from relative path
 */
export function getAbsoluteFilePath(relativePath: string): string {
    return path.join(process.cwd(), relativePath);
}
