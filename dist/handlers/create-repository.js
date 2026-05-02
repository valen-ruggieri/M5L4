import { GitHubClient } from '../github/client.js';
import { CreateRepositorySchema } from '../tools/repos.js';
const client = new GitHubClient();
export async function createRepositoryHandler(args) {
    // Paso 1: validar con safeParse
    const result = CreateRepositorySchema.safeParse(args);
    if (!result.success) {
        return {
            isError: true,
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        code: "VALIDATION_ERROR",
                        message: result.error.issues[0]?.message,
                        field: result.error.issues[0]?.path[0]
                    })
                }]
        };
    }
    // Extraer datos validados
    const { name, description, private: isPrivate } = result.data;
    // Paso 2: llamar a GitHub
    try {
        const repo = await client.createRepo(name, {
            description,
            private: isPrivate
        });
        // Paso 3: DTO mínimo
        const dto = {
            owner: repo.owner.login,
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            html_url: repo.html_url,
            default_branch: repo.default_branch
        };
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(dto)
                }]
        };
    }
    catch (error) {
        // Paso 4: mapear errores
        const status = error?.status;
        if (status === 401)
            return {
                isError: true,
                content: [{ type: "text", text: JSON.stringify({
                            code: "UNAUTHORIZED",
                            message: "Token inválido o ausente. Verifica GITHUB_TOKEN.",
                            status: 401
                        }) }]
            };
        if (status === 403)
            return {
                isError: true,
                content: [{ type: "text", text: JSON.stringify({
                            code: "FORBIDDEN",
                            message: "Sin permisos o rate limit alcanzado. Revisa los scopes del token.",
                            status: 403
                        }) }]
            };
        if (status === 422)
            return {
                isError: true,
                content: [{ type: "text", text: JSON.stringify({
                            code: "VALIDATION_ERROR",
                            message: "Nombre inválido o repositorio ya existe. Cambia el nombre o usa get_repository para consultarlo.",
                            status: 422
                        }) }]
            };
        throw error;
    }
}
//# sourceMappingURL=create-repository.js.map