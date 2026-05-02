import { GitHubClient } from "../github/client.js";

const client = new GitHubClient();

console.log(' ===== Repos con rate limit visible =====');
const repos = await client.listRepos(3);
repos.forEach(r => console.log(`${r.name} - ${r.visibility}`));

