export class GitHubError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'GitHubError';
  }
}

export function handleError(error: any): never {
  const status = error?.status || 500;
  if (status === 401) throw new GitHubError('UNAUTHORIZED: token inválido', status);
  if (status === 403) throw new GitHubError('FORBIDDEN: sin permisos', status);
  if (status === 404) throw new GitHubError('NOT_FOUND: recurso no existe', status);
  if (status === 422) throw new GitHubError('VALIDATION_ERROR: datos inválidos (o repo duplicado)', status);
  throw new GitHubError(`UNKNOWN_ERROR: ${error?.message}`, status);
}