import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import { act } from 'react';

function TimeLabel({ date }: { date: Date }) {
  const text = useRelativeTime(date);
  return <span data-testid="time-label">{text}</span>;
}

describe('useRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('updates the displayed relative time over time', () => {
    const createdAt = new Date('2023-01-01T00:00:00Z');

    render(<TimeLabel date={createdAt} />);
    const el = screen.getByTestId('time-label');
    const initial = el.textContent;

    // Advance 70 seconds to cross the 1-minute boundary
    act(() => {
      jest.setSystemTime(new Date('2023-01-01T00:01:10Z'));
      jest.advanceTimersByTime(70_000);
    });

    const updated = el.textContent;
    expect(updated).not.toEqual(initial);
  });
});