import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '@/app/auth/signin/page';
import * as nextAuthReact from 'next-auth/react';
import * as nextNavigation from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation', () => {
  const router = { push: jest.fn() };
  return {
    useRouter: () => router,
    useSearchParams: () => ({ get: () => null }),
  };
});

describe('SignIn page', () => {
  beforeEach(() => {
    (nextAuthReact.useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('redirects researcher to researcher dashboard on success', async () => {
    (nextAuthReact.signIn as jest.Mock).mockResolvedValue({ ok: true });
    (nextAuthReact.getSession as jest.Mock).mockResolvedValue({ user: { role: 'researcher' } });

    render(<SignIn />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'r@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const router = nextNavigation.useRouter() as unknown as { push: jest.Mock };
      expect(router.push).toHaveBeenCalledWith('/dashboard/researcher');
    });
  });

  it('shows error toast on failed sign-in', async () => {
    (nextAuthReact.signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });

    render(<SignIn />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'x@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'bad' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});