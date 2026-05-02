import 'dotenv/config';
import { Octokit } from '@octokit/rest';
import type { RepoSummary, IssueSummary } from './dto.js';
import { handleError } from './errors.js';
import { executeWithRetry, extractRateLimit } from './rate-limit.js';

export class GitHubClient {
  private octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  async listRepos(perPage = 10): Promise<RepoSummary[]> {
    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({ per_page: perPage });

      const rateLimit = extractRateLimit(response.headers as Record<string, string>);
      console.log(`Rate limit - restantes: ${rateLimit.remaining} / ${rateLimit.limit} | reset: ${rateLimit.resetAt.toLocaleTimeString()}`);

      return response.data.map(r => ({
        name: r.name,
        visibility: r.visibility ?? 'unknown',
        url: r.html_url,
        stars: r.stargazers_count ?? 0
      }));
    } catch (error) {
      handleError(error);
    }
  }

  async getRepo(owner: string, repo: string): Promise<RepoSummary> {
    try {
      const { data } = await this.octokit.rest.repos.get({ owner, repo });
      return {
        name: data.name,
        visibility: data.visibility ?? 'unknown',
        url: data.html_url,
        stars: data.stargazers_count ?? 0
      };
    } catch (error) {
      handleError(error);
    }
  }

  async listIssues(owner: string, repo: string): Promise<IssueSummary[]> {
    try {
      const { data } = await this.octokit.rest.issues.listForRepo({ owner, repo, per_page: 5 });
      return data.map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        url: i.html_url
      }));
    } catch (error) {
      handleError(error);
    }
  }


}