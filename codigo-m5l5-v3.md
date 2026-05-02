# Código de la V3 (M5L5)

## `src/tools/repos.ts` (Actualizado con RepoDTO)
```typescript
import { z } from 'zod';

export interface RepoDTO {
  owner: string;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}

export const badCreateRepository = {
  name: "create_repository",
  description: "Crea un repositorio.",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" }
    },
    required: ["name"]
  }
};

export const CreateRepositorySchema = z.object({
  name: z.string()
    .min(1, 'El nombre no puede estar vacio')
    .max(100, 'Maximo 100 caracteres')
    .regex(/^[a-zA-Z0-9\-]+$/,
      "Solo se permiten letras, números y guiones (-)"
    ),
  description: z.string().max(255).optional(),
  private: z.boolean().optional().default(false)
})

export const createRepositoryTool = {
  name: "create_repository",
  description: `Crea un repositorio nuevo en la cuenta autenticada.
  Usala solo si el repositorio no existe todavia.
  Si el nombre ya esta ocupado, elige otro nombre o usa get_repository para consultarlo.
  El campo name solo permite letras, numeros y guiones (1-100 caracteres).
  Ejemplo: {"name": "feature-user-profile", "description":"Feature de perfil de usuario", "private": true}`,
  schema: CreateRepositorySchema
}
```

## `src/handlers/create-repository.ts` (Nuevo)
```typescript
import { GitHubClient } from '../github/client.js';
import { CreateRepositorySchema } from '../tools/repos.js';
import type { RepoDTO } from '../tools/repos.js';

const client = new GitHubClient();

export async function createRepositoryHandler(args: unknown) {

  // Paso 1: validar con safeParse
  const result = CreateRepositorySchema.safeParse(args);

  if (!result.success) {
    return {
      isError: true,
      content: [{
        type: "text" as const,
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
    const dto: RepoDTO = {
      owner: repo.owner.login,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      default_branch: repo.default_branch
    };

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(dto)
      }]
    };

  } catch (error: any) {

    // Paso 4: mapear errores
    const status = error?.status;

    if (status === 401) return {
      isError: true,
      content: [{ type: "text" as const, text: JSON.stringify({
        code: "UNAUTHORIZED",
        message: "Token inválido o ausente. Verifica GITHUB_TOKEN.",
        status: 401
      })}]
    };

    if (status === 403) return {
      isError: true,
      content: [{ type: "text" as const, text: JSON.stringify({
        code: "FORBIDDEN",
        message: "Sin permisos o rate limit alcanzado. Revisa los scopes del token.",
        status: 403
      })}]
    };

    if (status === 422) return {
      isError: true,
      content: [{ type: "text" as const, text: JSON.stringify({
        code: "VALIDATION_ERROR",
        message: "Nombre inválido o repositorio ya existe. Cambia el nombre o usa get_repository para consultarlo.",
        status: 422
      })}]
    };

    throw error;
  }
}
```

## `src/server/index.ts` (Actualizado)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { CreateRepositorySchema, createRepositoryTool } from '../tools/repos.js'
import { createRepositoryHandler } from '../handlers/create-repository.js';

class MCPServerWrapper {
  private tools: any[] = [];
  private handlers: Record<string, any> = {};
  public server = new Server({ name: "github-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

  constructor() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: this.tools }));
    this.server.setRequestHandler(CallToolRequestSchema, async (req) => {
      const handler = this.handlers[req.params.name];
      if (!handler) throw new Error("Tool no encontrada");
      return handler(req.params.arguments);
    });
  }

  registerTool(name: string, options: { description: string, inputSchema: any }, handler: any) {
    const jsonSchema = zodToJsonSchema(options.inputSchema);
    const { $schema, ...cleanSchema } = jsonSchema as any;

    this.tools.push({
      name,
      description: options.description,
      inputSchema: {
        type: "object",
        ...cleanSchema
      }
    });
    this.handlers[name] = handler;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new MCPServerWrapper();

server.registerTool(
  createRepositoryTool.name,
  {
    description: createRepositoryTool.description,
    inputSchema: createRepositoryTool.schema
  },
  createRepositoryHandler
);

server.start().catch(console.error);
```
