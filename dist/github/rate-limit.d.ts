export interface RateLimitSummary {
    limit: number;
    remaining: number;
    resetAt: Date;
}
export declare function extractRateLimit(headers: Record<string, string>): RateLimitSummary;
export declare function shouldRetry(status: number, headers: Record<string, string>): boolean;
export declare function getRetryDelayMs(headers: Record<string, string>): number;
export declare function executeWithRetry<T>(fn: () => Promise<T>, maxRetries?: number): Promise<T>;
//# sourceMappingURL=rate-limit.d.ts.map