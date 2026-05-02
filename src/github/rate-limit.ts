export interface RateLimitSummary {
    limit: number;
    remaining: number;
    resetAt: Date;
}

export function extractRateLimit(headers: Record<string, string>): RateLimitSummary {
    const limit = parseInt(headers['x-ratelimit-limit'] ?? '0', 10);
    const remaining = parseInt(headers['x-ratelimit-remaining'] ?? '0', 10);
    const reset = parseInt(headers['x-ratelimit-reset'] ?? '0', 10);

    return {
        limit,
        remaining,
        resetAt: new Date(reset * 1000)
    }
}

export function shouldRetry(status: number, headers: Record<string, string>): boolean {
    if (status === 429) return true;
    if (status === 403) {
        const remaining = parseInt(headers['x-ratelimit-remaining'] ?? '1', 10);
        return remaining === 0;
    }
    return false;
}


export function getRetryDelayMs(headers: Record<string, string>): number {
    const retryAfter = headers['retry-after'];
    if (retryAfter) return parseInt(retryAfter, 10) * 1000;

    const reset = parseInt(headers['x-ratelimit-reset'] ?? '0', 10);
    if (reset > 0) return Math.max(reset * 1000 - Date.now(), 0);

    return 2000
}


export async function executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 2
): Promise<T> {

    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            return await fn();

        } catch (error: any) {
            const status = error?.status ?? 0;
            const headers = error?.response?.headers ?? {};

            if (attempt < maxRetries && shouldRetry(status, headers)) {
                const delay = getRetryDelayMs(headers);
                console.log(`Intento ${attempt + 1} fallido. Esperando ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
            } else {
                throw error;
            }
        }
    }
    throw new Error('Se agotaron los reintentos');



}