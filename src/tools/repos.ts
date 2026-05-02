import { z } from 'zod';

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