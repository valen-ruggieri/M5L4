import 'dotenv/config';

const token = process.env.GITHUB_TOKEN;

const response = await fetch('https://api.github.com/user/repos?per_page=5', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }
});

if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
}

const repos = await response.json();
repos.forEach((repo: any) => {
    console.log(`${repo.name} — ${repo.visibility}`)
});

