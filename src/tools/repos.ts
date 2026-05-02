
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

