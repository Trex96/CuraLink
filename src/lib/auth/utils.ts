import { UserRole } from '@/types';
import { AuthUser } from '@/types';

interface UserWithName extends AuthUser {
  firstName?: string;
  lastName?: string;
}

// Check if user has a specific role
export function hasRole(user: UserWithName | null | undefined, role: UserRole): boolean {
  return user?.role === role;
}

// Check if user is a patient
export function isPatient(user: UserWithName | null | undefined): boolean {
  return hasRole(user, UserRole.PATIENT);
}

// Check if user is a researcher
export function isResearcher(user: UserWithName | null | undefined): boolean {
  return hasRole(user, UserRole.RESEARCHER);
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  // Add more validation rules as needed
  return { valid: true };
}

// Validate email format
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Format user name
export function formatUserName(user: UserWithName | null | undefined): string {
  if (!user) return '';
  return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '';
}