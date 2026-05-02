import { z } from 'zod';

export const UpdateIssueSchema = z.object({
    owner: z.string().min(1, "Owner requerido"),
    repo: z.string().min(1, "Repo requerido"),
    issue_number: z.number().int().positive("El numero de issue debe ser positivo"),
    title: z.string().min(3, "El titulo debe tener al menos 3 caracteres").optional(),
    body: z.string().optional(),
    state: z.enum(["open", "closed"]).optional(),
    labels: z.array(z.string().min(1)).optional(),
    assignees: z.array(z.string().min(1)).optional(),
}).refine(
    (data) =>
        data.title !== undefined ||
        data.body !== undefined ||
        data.state !== undefined ||
        data.labels !== undefined ||
        data.assignees !== undefined,
    {
        message: " Al menos un campo editable (title, body, state, labels, assignees) debe estar registrado"
    }

);

export const updateIssueTool = {
    name: "update_issue",
    description: `Actualiza campos de un issue existente en GitHub.
Úsala solo para modificar un issue, no para leerlo (usa get_issue para eso).
Requiere issue_number y al menos uno de: title, body, state, labels, assignees.
El campo state solo acepta "open" o "closed".
Ejemplo: {"owner": "mi-usuario", "repo": "mi-repo", "issue_number": 42, "state": "closed"}`,
    schema: UpdateIssueSchema
};