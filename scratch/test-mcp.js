import { spawn } from 'child_process';
import { resolve } from 'path';
const serverPath = resolve(process.cwd(), 'src/server/index.ts');
const child = spawn('npx', ['tsx', serverPath], { stdio: ['pipe', 'pipe', 'inherit'], shell: true });
let messageId = 1;
function sendRequest(method, params = {}) {
    const request = {
        jsonrpc: "2.0",
        id: messageId++,
        method,
        params
    };
    const str = JSON.stringify(request);
    console.log('\n--- ENVIANDO ---');
    console.log(JSON.stringify(request, null, 2));
    child.stdin.write(str + '\n');
}
child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
        if (!line)
            continue;
        try {
            const parsed = JSON.parse(line);
            console.log('\n--- RESPUESTA ---');
            console.log(JSON.stringify(parsed, null, 2));
        }
        catch (e) {
            console.log('\n--- RAW STDOUT ---');
            console.log(line);
        }
    }
});
setTimeout(() => {
    // 1. Initialise
    sendRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
    });
    // 2. tools/list
    setTimeout(() => {
        sendRequest("notifications/initialized");
        sendRequest("tools/list");
        // 3. tools/call (happy path)
        setTimeout(() => {
            const repoName = `test-repo-${Date.now()}`;
            sendRequest("tools/call", {
                name: "create_repository",
                arguments: {
                    name: repoName,
                    description: "Repositorio de prueba",
                    private: true
                }
            });
            // 4. tools/call (Error Zod Local - Nombre inválido con espacios)
            setTimeout(() => {
                sendRequest("tools/call", {
                    name: "create_repository",
                    arguments: {
                        name: "nombre invalido con espacios",
                        description: "Probando validación de Zod",
                        private: true
                    }
                });
                // 5. tools/call (Error 422 Remoto - Repo duplicado)
                setTimeout(() => {
                    sendRequest("tools/call", {
                        name: "create_repository",
                        arguments: {
                            name: repoName,
                            description: "Intentando crear un repositorio que ya existe",
                            private: true
                        }
                    });
                    setTimeout(() => {
                        child.kill();
                        process.exit(0);
                    }, 4000);
                }, 4000);
            }, 4000);
        }, 2000);
    }, 1000);
}, 1000);
//# sourceMappingURL=test-mcp.js.map