'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publicationSchema } from '@/lib/validation/researcher';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Publication } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { FileUpload } from './file-upload';

type PublicationFormValues = import('zod').infer<typeof publicationSchema>;

interface AddManuallyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSuccess: (publication: Publication) => void;
}

export function AddManuallyDialog({ open, onOpenChange, onAddSuccess }: AddManuallyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<{ path: string; originalName: string; size: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: '',
      authors: '',
      journal: '',
      publicationDate: new Date(),
      abstract: '',
      doi: '',
      pmid: '',
      citations: 0,
      description: '',
    },
  });

  const onSubmit = async (data: PublicationFormValues) => {
    setIsSubmitting(true);
    try {
      // Upload file first if selected
      let fileData = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/publications/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload PDF file');
        }

        const uploadResult = await uploadResponse.json();
        fileData = {
          path: uploadResult.file.path,
          originalName: uploadResult.file.originalName,
          size: uploadResult.file.size,
        };
        setUploadedFileData({
          path: uploadResult.file.path,
          originalName: uploadResult.file.originalName,
          size: uploadResult.file.size,
        });
      }

      // Process authors field
      const authors = typeof data.authors === 'string'
        ? data.authors.split(',').map(author => author.trim()).filter(author => author)
        : data.authors;

      const response = await fetch('/api/publications/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publication: {
            ...data,
            authors,
            publicationDate: data.publicationDate.toISOString(),
            ...(fileData && {
              pdfFile: fileData.path,
              pdfOriginalName: fileData.originalName,
              fileSize: fileData.size,
            }),
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add publication');
      }

      const result = await response.json();
      onAddSuccess(result.publication);

      toast.success('Success', {
        description: 'Publication added successfully',
      });

      // Reset form
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to add publication',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Publication Manually</DialogTitle>
          <DialogDescription>
            Enter the details of your publication manually
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Publication title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="journal">Journal *</Label>
              <Input
                id="journal"
                {...register('journal')}
                placeholder="Journal name"
              />
              {errors.journal && (
                <p className="text-sm text-red-500">{errors.journal.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authors">Authors *</Label>
            <Input
              id="authors"
              {...register('authors')}
              placeholder="Author names (comma separated)"
            />
            <p className="text-xs text-muted-foreground">
              Enter author names separated by commas (e.g., John Doe, Jane Smith)
            </p>
            {errors.authors && (
              <p className="text-sm text-red-500">
                {typeof errors.authors.message === 'string'
                  ? errors.authors.message
                  : 'Invalid authors format'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publicationDate">Publication Date *</Label>
              <Input
                id="publicationDate"
                type="date"
                {...register('publicationDate', {
                  setValueAs: (v) => v ? new Date(v) : new Date()
                })}
              />
              {errors.publicationDate && (
                <p className="text-sm text-red-500">
                  {typeof errors.publicationDate.message === 'string'
                    ? errors.publicationDate.message
                    : 'Invalid date'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="citations">Citations</Label>
              <Input
                id="citations"
                type="number"
                {...register('citations', {
                  setValueAs: (v) => v ? parseInt(v as string) : 0
                })}
                min="0"
              />
              {errors.citations && (
                <p className="text-sm text-red-500">{errors.citations.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                {...register('doi')}
                placeholder="Digital Object Identifier"
              />
              {errors.doi && (
                <p className="text-sm text-red-500">{errors.doi.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pmid">PMID</Label>
              <Input
                id="pmid"
                {...register('pmid')}
                placeholder="PubMed ID"
              />
              {errors.pmid && (
                <p className="text-sm text-red-500">{errors.pmid.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              {...register('abstract')}
              placeholder="Publication abstract"
              rows={4}
            />
            {errors.abstract && (
              <p className="text-sm text-red-500">{errors.abstract.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional description or notes about this publication"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>PDF File (Optional)</Label>
            <FileUpload
              onFileSelect={setSelectedFile}
              currentFile={uploadedFileData}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Publication'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}