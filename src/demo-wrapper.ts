import { GitHubClient } from './github/client.js';

const client = new GitHubClient();

// Operación 1: listar repos
console.log('\n=== Repos ===');
const repos = await client.listRepos(4);
repos.forEach(r => console.log(`${r.name} — ${r.visibility} — ⭐ ${r.stars}`));

// Operación 2: repo específico
console.log('\n=== Repo específico ===');
// Usamos tu usuario y un repo que sabemos que existe en tu cuenta para que funcione la demo
const repo = await client.getRepo('valen-ruggieri', 'demo-mcp');
console.log(repo);

// Operación 3: repo inexistente — manejo de error
console.log('\n=== Repo inexistente ===');
try {
  await client.getRepo('usuario-xyz', 'repo-que-no-existe-xyz');
} catch (error) {
  console.error((error as Error).message);
}
