// Rate limiter utility to handle NCBI E-utilities rate limiting (max 3 requests/second)
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 3, timeWindow: number = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    // If we've reached the limit, wait until we can make another request
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const timeToWait = this.timeWindow - (now - oldestRequest);
      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
        return this.wait(); // Recursively check again after waiting
      }
    }
    
    // Add current request
    this.requests.push(now);
  }
}

// Create a global rate limiter instance for NCBI E-utilities
export const ncbiRateLimiter = new RateLimiter(3, 1000); // 3 requests per second

export default RateLimiter;