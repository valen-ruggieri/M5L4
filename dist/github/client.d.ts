import 'dotenv/config';
import type { RepoSummary, IssueSummary } from './dto.js';
export declare class GitHubClient {
    private octokit;
    listRepos(perPage?: number): Promise<RepoSummary[]>;
    getRepo(owner: string, repo: string): Promise<RepoSummary>;
    listIssues(owner: string, repo: string): Promise<IssueSummary[]>;
    createRepo(name: string, options?: {
        description?: string;
        private?: boolean;
    }): Promise<any>;
}
//# sourceMappingURL=client.d.ts.map