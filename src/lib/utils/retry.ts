// Retry utility with exponential backoff for handling failed requests

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  jitter?: boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    jitter = true
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      let delay = initialDelay * Math.pow(factor, attempt);
      
      // Apply jitter if requested
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
      
      // Cap the delay at maxDelay
      delay = Math.min(delay, maxDelay);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw lastError || new Error('Retry failed');
}

export default retryWithBackoff;