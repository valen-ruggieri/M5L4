import { GitHubClient } from "../github/client.js";
import { CreateRepositorySchema } from "../tools/repos.js";
const client = new GitHubClient();
export async function createRepositoryHandler(args) {
    const result = CreateRepositorySchema.safeParse(args);
    if (!result.success) {
        return {
            isError: true,
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        code: "VALIDATION_ERROR",
                        message: result.error.issues[0]?.message,
                        field: result.error.issues[0]?.path
                    })
                }]
        };
    }
    const { name, private: isPrivate, description } = result.data;
    try {
        const repo = await client.createRepo(name, {
            description,
            private: isPrivate
        });
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
        const status = error?.status ?? 500;
        const errorMap = {
            401: {
                code: "UNAUTHORIZED",
                message: "Token invalido o ausente"
            },
            403: {
                code: "FORBBIDEN",
                message: "Sin permisos o rate limit alcanzado"
            },
            422: {
                code: "VALIDATION_ERROR",
                message: "Nombre invalido o repositorio ya existe"
            }
        };
        const maped = errorMap[status] ?? {
            code: "UNKNOWN_ERROR",
            message: `error inesperado (${status})`
        };
        return {
            isError: true,
            content: [{
                    type: "text",
                    text: JSON.stringify({ ...maped, status })
                }]
        };
    }
}
//# sourceMappingURL=create-repository.js.map