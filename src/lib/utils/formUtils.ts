import { toast } from 'sonner';

// Form submission utility
export async function submitForm<T>(
  data: T,
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST'
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to ${method.toLowerCase()} data`);
  }

  return response;
}

// File upload utility
export async function uploadFile(file: File, url: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload file');
  }

  const result = await response.json();
  return result.url;
}

// Form error handler
export function handleFormError(error: unknown, defaultMessage: string = 'An error occurred'): void {
  const message = error instanceof Error ? error.message : defaultMessage;
  toast.error(message);
  console.error('Form error:', error);
}

// Form success handler
export function handleFormSuccess(message: string): void {
  toast.success(message);
}

// Draft save utility
export function saveDraft<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

// Draft load utility
export function loadDraft<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

// Draft clear utility
export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}