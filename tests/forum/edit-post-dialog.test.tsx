import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditPostDialog from '@/components/forum/forms/containers/EditPostDialog';

describe('EditPostDialog', () => {
  test('submits updated values', async () => {
    const onSubmit = jest.fn();
    render(
      <EditPostDialog
        open={true}
        onOpenChange={() => {}}
        initial={{ title: 'Old', content: '<p>Old</p>', category: 'General', tags: ['a'] }}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: '<p>New Content</p>' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'General' } });
    fireEvent.change(screen.getByLabelText('Tags (comma-separated)'), { target: { value: 'x,y' } });

    fireEvent.click(screen.getByText('Save'));

    // onSubmit is async; let microtask queue flush
    await Promise.resolve();

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New Title',
      content: '<p>New Content</p>',
      category: 'General',
      tags: ['x', 'y'],
    });
  });
});