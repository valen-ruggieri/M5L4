import { Octokit } from '@octokit/rest';
import 'dotenv/config';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: 5
});

repos.forEach((repo) => {
    console.log(`${repo.name} — ${repo.visibility}`);
})