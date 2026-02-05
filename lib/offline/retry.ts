export interface RetryConfig {
  retries?: number;
  retryOn?: number[];
  baseDelay?: number;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  retries: 3,
  retryOn: [503, 504, 429], // Service Unavailable, Gateway Timeout, Too Many Requests
  baseDelay: 1000, // 1 second
};

/**
 * Fetch with exponential backoff retry
 *
 * Retries failed requests with exponential backoff: 1s, 2s, 4s
 * On final failure, throws the error for caller to handle fallback.
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param retryConfig - Retry configuration
 * @returns Response from successful fetch
 * @throws Error on final failure after all retries exhausted
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success or non-retryable error status
      if (response.ok || !config.retryOn.includes(response.status)) {
        return response;
      }

      // Retryable error status
      if (attempt < config.retries) {
        const delay = config.baseDelay * Math.pow(2, attempt);
        console.warn(
          `[Retry] Attempt ${attempt + 1}/${config.retries} for ${url} failed with ${response.status}. Retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Final attempt - return response even if not ok (let caller handle)
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.retries) {
        const delay = config.baseDelay * Math.pow(2, attempt);
        console.warn(
          `[Retry] Attempt ${attempt + 1}/${config.retries} for ${url} failed with network error. Retrying in ${delay}ms...`,
          lastError.message
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Final attempt - throw error
      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError || new Error('Fetch failed after retries');
}
