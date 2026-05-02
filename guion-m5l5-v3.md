# Video M5L5 V3 — Guion Narrado
## Tool MCP Completa: Integración con GitHub y Errores Accionables

## 0:00 → 0:45 — Intro
*VS Code abierto con el proyecto. Terminal limpia.*
> "En los dos videos anteriores diseñamos contratos claros y validaciones estrictas. En este video cerramos el ciclo: implementamos una tool MCP completa de punta a punta. Schema Zod, publicación del inputSchema, validación con safeParse, llamada a GitHub, DTO mínimo, errores accionables. Y al final lo validamos en el Inspector con un caso exitoso y un caso de error."

## 0:45 → 1:30 — El ciclo completo
> "Antes de escribir código, el ciclo que vamos a implementar."
> "Uno: el agente llama tools/call con los argumentos. Dos: validamos con safeParse — si falla, devolvemos el error de Zod antes de tocar GitHub. Tres: si pasa, llamamos a GitHubClient. Cuatro: transformamos la respuesta al DTO mínimo. Cinco: si GitHub falla, mapeamos el error a un mensaje accionable. Seis: devolvemos la respuesta estructurada."
> "Ese ciclo es el mismo para cualquier tool. Lo que cambia es el schema, el método de GitHub y el DTO."

## 1:30 → 2:30 — El schema con el que arrancamos
*Abrir `src/tools/repos.ts`. Mostrar el schema del video anterior.*
```typescript
export const CreateRepositorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(100, "Máximo 100 caracteres")
    .regex(
      /^[a-zA-Z0-9\-]+$/,
      "Solo se permiten letras, números y guiones (-)"
    ),
  description: z.string().max(255).optional(),
  private: z.boolean().optional().default(false),
});
```
> "Este es el schema que diseñamos en el video 1. Ya tiene las restricciones — ahora vamos a construir el handler que lo usa."

## 2:30 → 3:15 — El DTO mínimo
**La explicación primero:**
> "La respuesta de GitHub para createForAuthenticatedUser tiene más de 100 campos. El agente no necesita todos — necesita los campos que le permiten confirmar que la operación fue exitosa y seguir el flujo."
> "Un DTO mínimo tiene: identificación del recurso, estado actual, y URL para referencia. Nada más."

**Ahora el código:**
```typescript
interface RepoDTO {
  owner: string;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}
```
> "Seis campos. Con eso el agente sabe que el repo existe, quién es el dueño, si es privado y dónde accederlo."

## 3:15 → 5:30 — El handler completo
**La explicación primero:**
> "El handler sigue el ciclo que describimos. Primero valida. Si falla, devuelve el error de Zod. Si pasa, llama a GitHub. Si GitHub falla, mapea el error. Si todo sale bien, devuelve el DTO."
> "Cada paso es explícito y predecible. El agente siempre recibe algo estructurado — ya sea el DTO del repo o un error accionable."

**Ahora el código:**
*Crear `src/handlers/create-repository.ts`.*
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
```
*Señalar safeParse.*
> "Si la validación falla, devolvemos el error inmediatamente — sin llamar a GitHub. El mensaje viene del schema Zod y le dice al agente exactamente qué campo está mal."

```typescript
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
```
*Señalar el DTO.*
> "La respuesta de GitHub entra, mapeamos solo los seis campos del DTO y eso es lo que sale. El agente no ve nada más."

```typescript
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
*Señalar el 422.*
> "El 422 es el caso más importante. Si el repo ya existe, GitHub devuelve 422. El mensaje le dice al agente qué hacer: cambiar el nombre o consultar si ya existe. No expone detalles internos — solo la acción correctiva."

*Señalar el throw error final.*
> "Y si es un error que no esperamos, lo relanzamos. El servidor MCP lo captura y lo reporta sin romper el canal."

## 5:30 → 6:15 — Registrar la tool en el server
*Abrir `src/server/index.ts`.*
```typescript
import { createRepositoryTool, CreateRepositorySchema } from '../tools/repos.js';
import { createRepositoryHandler } from '../handlers/create-repository.js';

server.registerTool(
  createRepositoryTool.name,
  {
    description: createRepositoryTool.description,
    inputSchema: createRepositoryTool.schema
  },
  createRepositoryHandler
);
```
> "Una línea que conecta el contrato con el handler. El schema Zod se convierte a JSON Schema automáticamente — visible en tools/list."

*Terminal.*
```bash
npm run dev
```

## 6:15 → 7:00 — tools/list en el Inspector
*Abrir el Inspector.*
```bash
npm run inspector
```
*Click en Connect. Click en Tools → List Tools.*
*Mostrar create_repository con el schema completo.*
*Señalar el pattern con el regex.*
> "El pattern está publicado. El minLength, el maxLength, los campos requeridos. Eso es lo que el LLM recibe. Un contrato completo y sin ambigüedad."

## 7:00 → 8:00 — tools/call caso exitoso
*En el Inspector, click en `create_repository`. Completar el formulario.*
```json
{
  "name": "mcp-demo-feature-x",
  "description": "Repositorio de prueba creado vía MCP",
  "private": false
}
```
*Click en Run. Mostrar la respuesta.*
```json
{
  "owner": "mi-usuario",
  "name": "mcp-demo-feature-x",
  "full_name": "mi-usuario/mcp-demo-feature-x",
  "private": false,
  "html_url": "https://github.com/mi-usuario/mcp-demo-feature-x",
  "default_branch": "main"
}
```
*Pausar 2 segundos.*
> "El repo se creó. La respuesta tiene exactamente los seis campos del DTO — nada más. El agente puede confirmar el éxito y seguir el flujo."

## 8:00 → 9:00 — tools/call caso de error
*Volver al formulario. Poner un nombre inválido.*
```json
{
  "name": "repo inválido con espacios!!!"
}
```
*Click en Run. Mostrar la respuesta.*
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Solo se permiten letras, números y guiones (-)",
  "field": "name"
}
```
*Pausar 2 segundos.*
> "El error llegó de Zod — antes de tocar GitHub. El mensaje dice qué campo está mal y por qué. El agente puede corregir el input sin depender de que GitHub le diga qué salió mal."

*Ahora simular el repo duplicado — poner el mismo nombre del repo que ya existe.*
```json
{
  "name": "mcp-demo-feature-x"
}
```
*Click en Run.*
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Nombre inválido o repositorio ya existe. Cambia el nombre o usa get_repository para consultarlo.",
  "status": 422
}
```
> "Este error vino de GitHub — 422 porque el repo ya existe. Pero el mensaje ya le dice al agente qué hacer: cambiar el nombre o consultar con get_repository. Eso es un error accionable."

## 9:00 → 9:45 — Cierre
*Editor con el handler y el Inspector visibles.*
> "El ciclo completo en siete pasos: schema, publicación, validación, llamada a GitHub, DTO, errores accionables, respuesta estructurada."
> 
> "Lo que distingue una tool robusta de una frágil es que cada paso del ciclo está pensado para el consumidor — ya sea un dev, un agente AI o el Inspector. El schema previene 422. La descripción previene mis-selection. El DTO previene que el agente procese más de lo que necesita. Y los errores accionables previenen loops de error donde el agente no sabe qué hacer."
> 
> "Con este patrón, cualquier tool que construyas sobre GitHub va a ser predecible, autoexplicativa y capaz de guiar el siguiente paso incluso cuando algo falla."
