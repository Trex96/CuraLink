'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type Attachment = { url: string; name: string; size: number };

export type CreatePostFormData = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  attachments?: Attachment[];
};

export function PostForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (data: CreatePostFormData) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const isClient = typeof window !== 'undefined';
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  }, [isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const html = editor ? editor.getHTML() : content;
    await onSubmit({ title, content: html, category, tags });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <div className="rounded-md border">
              <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/50">
                <Button type="button" size="sm" variant={editor?.isActive('bold') ? 'default' : 'outline'} aria-label="Bold" aria-pressed={editor?.isActive('bold') ? true : false} onClick={() => editor?.chain().focus().toggleBold().run()}>
                  B
                </Button>
                <Button type="button" size="sm" variant={editor?.isActive('italic') ? 'default' : 'outline'} aria-label="Italic" aria-pressed={editor?.isActive('italic') ? true : false} onClick={() => editor?.chain().focus().toggleItalic().run()}>
                  I
                </Button>
                <Button type="button" size="sm" variant={editor?.isActive('heading', { level: 1 }) ? 'default' : 'outline'} aria-label="Heading 1" aria-pressed={editor?.isActive('heading', { level: 1 }) ? true : false} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
                  H1
                </Button>
                <Button type="button" size="sm" variant={editor?.isActive('heading', { level: 2 }) ? 'default' : 'outline'} aria-label="Heading 2" aria-pressed={editor?.isActive('heading', { level: 2 }) ? true : false} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                  H2
                </Button>
                <Button type="button" size="sm" variant={editor?.isActive('heading', { level: 3 }) ? 'default' : 'outline'} aria-label="Heading 3" aria-pressed={editor?.isActive('heading', { level: 3 }) ? true : false} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
                  H3
                </Button>
                <Button type="button" size="sm" variant={editor?.isActive('bulletList') ? 'default' : 'outline'} aria-label="Bullet list" aria-pressed={editor?.isActive('bulletList') ? true : false} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                  • List
                </Button>
                <Button type="button" size="sm" variant={editor?.isActive('orderedList') ? 'default' : 'outline'} aria-label="Numbered list" aria-pressed={editor?.isActive('orderedList') ? true : false} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                  1. List
                </Button>
              </div>
              <div className="min-h-[200px] p-3">
                {editor ? (
                  <EditorContent
                    editor={editor}
                    aria-label="Post content editor"
                    onKeyDown={(e) => {
                      const mod = e.metaKey || e.ctrlKey;
                      if (mod && e.key.toLowerCase() === 'b') {
                        e.preventDefault();
                        editor.chain().focus().toggleBold().run();
                      } else if (mod && e.key.toLowerCase() === 'i') {
                        e.preventDefault();
                        editor.chain().focus().toggleItalic().run();
                      }
                    }}
                  />
                ) : (
                  <div className="min-h-[160px]" aria-busy="true" aria-label="Loading editor" />
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={loading}>Create</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
