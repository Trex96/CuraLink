'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostFormData } from '../types';

type EditPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: PostFormData;
  onSubmit: (values: PostFormData) => Promise<void> | void;
};

export default function EditPostDialog({ open, onOpenChange, initial, onSubmit }: EditPostDialogProps) {
  const [values, setValues] = useState<PostFormData>(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  if (!open) return null;

  const handleChange = (field: keyof PostFormData, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: field === 'tags' ? value.split(',').map(t => t.trim()).filter(Boolean) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-md bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium mb-1">Title</label>
            <Input
              id="edit-title"
              value={values.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium mb-1">Content</label>
            <textarea
              id="edit-content"
              className="w-full rounded-md border p-2 min-h-[120px]"
              value={values.content}
              onChange={(e) => handleChange('content', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium mb-1">Category</label>
            <Input
              id="edit-category"
              value={values.category}
              onChange={(e) => handleChange('category', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input
              id="edit-tags"
              value={values.tags.join(', ')}
              onChange={(e) => handleChange('tags', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={handleCancel}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}