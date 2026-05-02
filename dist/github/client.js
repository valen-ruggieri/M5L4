import 'dotenv/config';
import { Octokit } from '@octokit/rest';
import { handleError } from './errors.js';
import { executeWithRetry, extractRateLimit } from './rate-limit.js';
export class GitHubClient {
    octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    async listRepos(perPage = 10) {
        try {
            const response = await this.octokit.rest.repos.listForAuthenticatedUser({ per_page: perPage });
            const rateLimit = extractRateLimit(response.headers);
            console.log(`Rate limit - restantes: ${rateLimit.remaining} / ${rateLimit.limit} | reset: ${rateLimit.resetAt.toLocaleTimeString()}`);
            return response.data.map(r => ({
                name: r.name,
                visibility: r.visibility ?? 'unknown',
                url: r.html_url,
                stars: r.stargazers_count ?? 0
            }));
        }
        catch (error) {
            handleError(error);
        }
    }
    async getRepo(owner, repo) {
        try {
            const { data } = await this.octokit.rest.repos.get({ owner, repo });
            return {
                name: data.name,
                visibility: data.visibility ?? 'unknown',
                url: data.html_url,
                stars: data.stargazers_count ?? 0
            };
        }
        catch (error) {
            handleError(error);
        }
    }
    async listIssues(owner, repo) {
        try {
            const { data } = await this.octokit.rest.issues.listForRepo({ owner, repo, per_page: 5 });
            return data.map(i => ({
                number: i.number,
                title: i.title,
                state: i.state,
                url: i.html_url
            }));
        }
        catch (error) {
            handleError(error);
        }
    }
    async createRepo(name, options) {
        try {
            const { data } = await this.octokit.rest.repos.createForAuthenticatedUser({
                name,
                ...(options?.description ? { description: options.description } : {}),
                private: options?.private ?? false
            });
            return data;
        }
        catch (error) {
            handleError(error);
        }
    }
}
//# sourceMappingURL=client.js.map