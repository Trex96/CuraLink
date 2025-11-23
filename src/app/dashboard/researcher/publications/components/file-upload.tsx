'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    accept?: string;
    maxSize?: number; // in bytes
    currentFile?: { path: string; name?: string; originalName?: string; size: number } | null;
}

export function FileUpload({
    onFileSelect,
    accept = '.pdf',
    maxSize = 10 * 1024 * 1024, // 10MB
    currentFile
}: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const validateFile = (file: File): boolean => {
        // Check file type
        if (accept === '.pdf' && file.type !== 'application/pdf') {
            toast.error('Invalid file type', {
                description: 'Please upload a PDF file',
            });
            return false;
        }

        // Check file size
        if (file.size > maxSize) {
            toast.error('File too large', {
                description: `File size must be less than ${formatFileSize(maxSize)}`,
            });
            return false;
        }

        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
            onFileSelect(selectedFile);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile);
            onFileSelect(droppedFile);
        }
    }, [onFileSelect]);

    const handleRemove = () => {
        setFile(null);
        onFileSelect(null);
    };

    return (
        <div className="space-y-4">
            {!file && !currentFile && (
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-1">
                        Drop your PDF here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Maximum file size: {formatFileSize(maxSize)}
                    </p>
                    <input
                        id="file-upload"
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            )}

            {(file || currentFile) && (
                <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <File className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-sm font-medium">
                                {file?.name || currentFile?.name || 'Unknown file'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(file?.size || currentFile?.size || 0)}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
